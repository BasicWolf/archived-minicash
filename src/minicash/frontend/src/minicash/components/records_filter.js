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
    },

    renderDTInputs: function() {
        let options = {
            showTodayButton: true,
            allowInputToggle: true,
            format: minicash.CONTEXT.user.dateFormat,
            locale: utils.getLocale(),
        };

        this.getUI('dtFrom')
            .datetimepicker(options)
            .on('dp.change', () => {
            this.triggerMethod('filter:change');
        });

        this.getUI('dtTo')
            .datetimepicker(options)
            .on('dp.change', () => {
            this.triggerMethod('filter:change');
        });
    },

    renderTagsInput: function() {
        let $tagsInput = this.getUI('tagsInput');
        let $ti = this.getUI('tagsInput').tagsinput({
            tagClass: 'label label-primary',
            freeInput: false,
            typeaheadjs: {
                displayKey: 'name',
                valueKey: 'name',
                source: minicash.collections.tags.bloodhound.adapter(),
            },
        });

        $tagsInput.on('itemRemoved itemAdded', () => {
            this.triggerMethod('filter:change');
        });
    },

    onFilterChange: function() {
        let hasFilterCriteria = !_.isEmpty(this._collectFormData());
        this.uiEnable('applyBtn', hasFilterCriteria);
        this.uiEnable('clearBtn', hasFilterCriteria);
    },

    onApplyBtnClick: function() {
        this.applyFilter();
    },

    applyFilter: function(params=null) {
        let filterParams = params || this._collectFormData();
        this.view.records.search(filterParams);
    },

    _collectFormData: function() {
        let NO_DATA = {};
        let formData = this.getUI('filterForm').serializeForm();

        // ---- process dt_from, dt_to ---- //
        if (formData.dt_from) {
            let dtFrom = moment(formData.dt_from, minicash.CONTEXT.user.dateFormat);
            dtFrom.hour(0);
            dtFrom.minute(0);

            let backendDtFrom = dtFrom.format(minicash.CONTEXT.settings.DATETIME_FORMAT);
            formData.dt_from = backendDtFrom;
        } else {
            delete formData.dt_from;
        }

        if (formData.dt_to) {
            let dtTo = moment(formData.dt_to, minicash.CONTEXT.user.dateFormat);
            dtTo.hour(23);
            dtTo.minute(59);

            let backendDtTo = dtTo.format(minicash.CONTEXT.settings.DATETIME_FORMAT);
            formData.dt_to = backendDtTo;
        } else {
            delete formData.dt_to;
        }

        // ---- process tags ---- //
        delete formData['tags'];
        let tags = this.getUI('tagsInput').tagsinput('items');
        if (!_.isEmpty(tags)) {
            formData.tags = tags;
        }

        return formData;
    },

    onClearBtnClick: function() {
        this.getUI('dtTo').datetimepicker('clear');
        this.getUI('dtFrom').datetimepicker('clear');
        this.getUI('tagsInput').tagsinput('removeAll');
        this.triggerMethod('filter:change');
        this.applyFilter({});
    },
});
