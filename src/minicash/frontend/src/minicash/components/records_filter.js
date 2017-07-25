'use strict';

/* global _,moment,minicash */

import Mn from 'backbone.marionette';

import * as utils from 'minicash/utils';

export let RecordsFilter = utils.BaseBehavior.extend({
    behaviors: [utils.TooltipBehavior, ],

    ui: {
        dtFrom: 'div[data-spec="dt_from"]',
        dtTo: 'div[data-spec="dt_to"]',
        tags: 'select[name="tags"]',
        tagsAllChk: 'input[name="tags_all"]',
        assetsFrom: 'select[name="assets_from"]',
        assetsTo: 'select[name="assets_to"]',
        mode: 'select[name="mode"]',
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
        this.renderTags();
        this.renderAssetsSelects();
        this.renderModeSelect();
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

    renderTags: function() {
        let data = minicash.collections.tags.map((it) => {
            return {id: it.id, text: it.get('name')};
        });

        let opts = {
            data: data,
            allowClear: true,
            placeholder: '',
        };

        this.getUI('tags').select2(opts);
    },

    renderAssetsSelects: function() {
        let data = minicash.collections.assets.map((it) => {
            return {id: it.id, text: it.get('name')};
        });

        let opts = {
            data: data,
            allowClear: true,
            placeholder: '',
        };

        this.getUI('assetsFrom').select2(opts);
        this.getUI('assetsTo').select2(opts);
    },

    renderModeSelect: function() {
        let data = _.map(minicash.CONTEXT.RECORD_MODES, (val) => { return {
            id: val.value,
            text: val.label,
        }; });

        let opts = {
            data: data,
            allowClear: true,
            placeholder: '',
        };

        this.getUI('mode').select2(opts);
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

        let tags = this.getUI('tags').select2().val();
        if (!_.isEmpty(tags)) {
            if (formData['tags_all']) {
                formData['tags_and'] = tags;
            } else {
                formData['tags_or'] = tags;
            }
        }

        delete formData['tags_all'];

        return formData;
    },

    onClearBtnClick: function() {
        this.getUI('dtTo').datetimepicker('clear');
        this.getUI('dtFrom').datetimepicker('clear');
        this.getUI('tags').val(null).trigger('change');
        this.getUI('tagsAllChk').prop('checked', false);
        this.getUI('assetsFrom').val(null).trigger('change');
        this.getUI('assetsTo').val(null).trigger('change');
        this.getUI('mode').val(null).trigger('change');
        this.applyFilter({});
    },
});
