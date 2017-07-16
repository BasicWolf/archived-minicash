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
        tagsOrInput: 'input[name="tags_or"]',
        tagsAndInput: 'input[name="tags_and"]',
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
        let $tagsOrInput = this.getUI('tagsOrInput');
        let $tagsAndInput = this.getUI('tagsAndInput');

        let opts = {
            tagClass: 'label label-primary',
            freeInput: false,
            typeaheadjs: {
                displayKey: 'name',
                valueKey: 'name',
                source: minicash.collections.tags.bloodhound.adapter(),
            },
        };
        this.getUI('tagsOrInput').tagsinput(opts);
        this.getUI('tagsAndInput').tagsinput(opts);

        $tagsOrInput.on('itemRemoved itemAdded', () => {
            if (!_.isEmpty($tagsAndInput.tagsinput('items'))) {
                $tagsAndInput.tagsinput('removeAll');
            }
            this.triggerMethod('filter:change');
        });

        $tagsAndInput.on('itemRemoved itemAdded', () => {
            if (!_.isEmpty($tagsOrInput.tagsinput('items'))) {
                $tagsOrInput.tagsinput('removeAll');
            }
            this.triggerMethod('filter:change');
        });
    },

    onFilterChange: function() {
        let hasFilterCriteria = !_.isEmpty(this._collectFormData());
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
        delete formData['tags_or'];
        let tagsOr = this.getUI('tagsOrInput').tagsinput('items');
        if (!_.isEmpty(tagsOr)) {
            formData['tags_or'] = tagsOr;
        }

        delete formData['tags_and'];
        let tagsAnd = this.getUI('tagsAndInput').tagsinput('items');
        if (!_.isEmpty(tagsAnd)) {
            formData['tags_and'] = tagsAnd;
        }

        return formData;
    },

    onClearBtnClick: function() {
        this.getUI('dtTo').datetimepicker('clear');
        this.getUI('dtFrom').datetimepicker('clear');
        this.getUI('tagsOrInput').tagsinput('removeAll');
        this.triggerMethod('filter:change');
        this.applyFilter({});
    },
});
