'use strict';

/* global _,moment,minicash */

import 'tagsinput';
import 'corejs-typeahead';
import Mn from 'backbone.marionette';

import * as utils from 'minicash/utils';

export let RecordsFilter = utils.BaseBehavior.extend({
    ui: {
        dtFrom: 'div[data-spec="dt_from"]',
        dtTo: 'div[data-spec="dt_to"]',
        tagsInput: 'input[name="tags"]',
        tagsAny: 'input[name="tags_any"]',
        assetsFrom: 'select[name="assets_from"]',
        assetsTo: 'select[name="assets_to"]',
        filterForm: 'form[name="filter_records_form"]',
        applyBtn: 'button[data-spec="apply"]',
        clearBtn: 'button[data-spec="clear"]',
    },

    events: {
        'click @ui.applyBtn': 'onApplyBtnClick',
        'click @ui.clearBtn': 'onClearBtnClick',
    },

    onRender: function() {
        this.renderDTInputs();
        this.renderTagsInput();
        this.renderAssetsSelects();
    },

    renderDTInputs: function() {
        let options = {
            showTodayButton: true,
            allowInputToggle: true,
            format: minicash.CONTEXT.user.dateFormat,
            locale: utils.getLocale(),
        };

        this.getUI('dtFrom').datetimepicker(options);
        this.getUI('dtTo').datetimepicker(options);
    },

    renderTagsInput: function() {
        let $tagsInput = this.getUI('tagsInput');

        this.getUI('tagsInput').tagsinput({
            tagClass: 'label label-primary',
            freeInput: false,
            typeaheadjs: {
                displayKey: 'name',
                valueKey: 'name',
                source: minicash.collections.tags.bloodhound.adapter(),
            },
        });
    },

    renderAssetsSelects: function() {
        let data = minicash.collections.assets.map((it) => {
            return {id: it.id, text: it.get('name')};
        });

        let opts = {
            data: data,
            allowClear: true,
            theme: "bootstrap",
        };

        this.getUI('assetsFrom').select2(opts);
        this.getUI('assetsTo').select2(opts);
    },

    onApplyBtnClick: function() {
        this.applyFilter();
    },

    applyFilter: function(params=null) {
        let filterParams = params || this._collectFormData();
        this.view.triggerMethod('filter:change', filterParams);
    },

    _collectFormData: function() {
        let formData = this.getUI('filterForm').serializeForm();

        // ---- process dt_from, dt_to ---- //
        if (formData['dt_from']) {
            let dtFrom = moment(formData.dt_from, minicash.CONTEXT.user.dateFormat);
            dtFrom.hour(0);
            dtFrom.minute(0);

            let backendDtFrom = dtFrom.format(minicash.CONTEXT.settings.DATETIME_FORMAT);
            formData['dt_from'] = backendDtFrom;
        } else {
            delete formData['dt_from'];
        }

        if (formData['dt_to']) {
            let dtTo = moment(formData.dt_to, minicash.CONTEXT.user.dateFormat);
            dtTo.hour(23);
            dtTo.minute(59);

            let backendDtTo = dtTo.format(minicash.CONTEXT.settings.DATETIME_FORMAT);
            formData['dt_to'] = backendDtTo;
        } else {
            delete formData['dt_to'];
        }

        // ---- process tags ---- //
        delete formData['tags'];

        let tags = this.getUI('tagsInput').tagsinput('items');
        if (!_.isEmpty(tags)) {
            if (formData['tags_any']) {
                formData['tags_or'] = tags;
            } else {
                formData['tags_and'] = tags;
            }
        }

        delete formData['tags_any'];

        return formData;
    },

    onClearBtnClick: function() {
        this.getUI('dtTo').datetimepicker('clear');
        this.getUI('dtFrom').datetimepicker('clear');
        this.getUI('tagsInput').tagsinput('removeAll');
        this.getUI('tagsAny').prop('checked', false);
        this.getUI('assetsFrom').val(null).trigger("change");
        this.getUI('assetsTo').val(null).trigger("change");
        this.applyFilter({});
    },
});
