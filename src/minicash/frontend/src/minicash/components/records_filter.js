'use strict';

/* global moment,minicash */

import Mn from 'backbone.marionette';


export let RecordsFilter = Mn.Behavior.extend({
    ui: {
        dtFrom: 'input[name="dt_from"]',
        dtTo: 'input[name="dt_to"]',
        tags: 'input[name="tags"]',
        filterForm: 'form[name="filter_records_form"]'
    },

    events: {

    },

    onRender: function() {
        let options = {
            showTodayButton: true,
            allowInputToggle: true,
            format: minicash.CONTEXT.user.dateFormat,
        };

        let $dtFrom = this.getUI('dtFrom');
        $dtFrom.parent()
            .datetimepicker(options)
            .on('dp.change', () => this.onFilterChange());

        let $dtTo = this.getUI('dtTo');
        $dtTo.parent()
            .datetimepicker(options)
            .on('dp.change', () => this.onFilterChange());
    },

    onFilterChange: function() {
        let formData = this._collectFormData();
        let res = this.view.records.search(formData);
    },


    _collectFormData: function() {
        let NO_DATA = {};
        let formData = this.getUI('filterForm').serializeForm();

        if (formData.dt_from) {
            let dtFrom = moment(formData.dt_from, minicash.CONTEXT.user.dateFormat);
            dtFrom.hour(0);
            dtFrom.minute(0);

            let backendDtFrom = dtFrom.format(minicash.CONTEXT.settings.DATETIME_FORMAT);
            formData.dt_from = backendDtFrom;
        }

        if (formData.dt_to) {
            let dtTo = moment(formData.dt_to, minicash.CONTEXT.user.dateFormat);
            dtTo.hour(23);
            dtTo.minute(59);

            let backendDtTo = dtTo.format(minicash.CONTEXT.settings.DATETIME_FORMAT);
            formData.dt_to = backendDtTo;
        }

        return formData;
    },

});
