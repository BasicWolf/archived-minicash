'use strict';

/* global $,_,moment,minicash,require */

import 'corejs-typeahead';
import Decimal from 'decimal.js';
import Radio from 'backbone.radio';
import Mn from 'backbone.marionette';

import * as models from 'minicash/models';
import * as utils from 'minicash/utils';
import * as views from 'minicash/views';
import {tr} from 'minicash/utils';
import {TabPanelView, TabModel} from 'components/tabbar';


let recordsChannel = Radio.channel('records');


export let RecordTab = TabModel.extend({
    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            viewClass: RecordTabPanelView,
            recordId: null,
        });
    },

    initialize: function() {
        let title = this.get('recordId') ? tr('Edit record') : tr('New record');
        this.set('title', title);
        TabModel.prototype.initialize.apply(this, arguments);
    },
});


export let RecordTabPanelView = TabPanelView.extend({
    uiInitialized: false,
    validator: null,

    template: require('templates/tab_record/tab_record.hbs'),

    ui: {
        saveBtn: 'button[data-spec="save"]',
        saveAddSimilarBtn: 'a[data-spec="save-add-similar"]',
        saveAddAnotherBtn: 'a[data-spec="save-add-another"]',
        cancelBtn: 'button[data-spec="cancel"]',
    },

    regions: {
        entriesRegion: {el: '[data-spec="entries-region"]'},
    },

    events: {
        'click @ui.saveBtn': 'onSaveBtnClick',
        'click @ui.saveAddSimilarBtn': 'onSaveAddSimilarBtnClick',
        'click @ui.saveAddAnotherBtn': 'onSaveAddAnotherBtnClick',
        'click @ui.cancelBtn': 'onCancelBtnClick',
    },

    modelEvents: {
        'change:record': 'render'
    },

    initialize: function() {
        // load bound record
        if (this.model.get('recordId')) {
            let record = new models.Record({pk: this.model.get('recordId')});
            record.fetch().then(() => {
                this.model.set('record', record);
            });
        } else {
            this.model.set('record', new models.Record());
        }
    },

    onRender: function() {
        this.showChildView('entriesRegion',
                           new SingleRecordFormView({model: this.model}));
    },

    onSaveBtnClick: function() {
        this.saveForm().then(() => {
            this.model.destroy();
        });
    },

    onSaveAddSimilarBtnClick: function() {
        this.saveForm().done(() => {
            this._renderNewRecordSimilarToOld();
        });
    },

    _renderNewRecordSimilarToOld: function() {
        let newRecord = this.model.get('record').clone();
        newRecord.unset(newRecord.idAttribute, {silent: true});
        newRecord.unset('delta', {silent: true});
        this.model.set('record', newRecord);
    },

    onSaveAddAnotherBtnClick: function() {
        this.saveForm().done(() => {
            this.model.unset('record');
        });
    },

    onCancelBtnClick: function() {
        this.model.destroy();
    },

    saveForm: function() {
        let dfd = this.getChildView('entriesRegion').saveForm();

        if (dfd.state() == 'rejected') {
            return dfd;
        }

        minicash.status.show(tr('Saving record'));
        this.lockControls();

        dfd.fail((response) => {
            this.unlockControls();
        }).always(() => {
            minicash.status.hide();
        });

        return dfd;
    },

    lockControls: function() {
        return this.uiDisable(['saveBtn', 'cancelBtn']);
    },

    unlockControls: function() {
        return this.uiEnable(['saveBtn', 'cancelBtn']);
    },
}); // RecordTabPanelView



let SingleRecordFormView = views.BaseView.extend({
    template: require('templates/tab_record/single_record_form.hbs'),

    ui: {
        modeSelect: 'select[name="mode"]',
        dtStampInput: 'input[name="created_dt"]',
        deltaInput: 'input[name="delta"]',
        tagsSelect: 'select[name="tags"]',
        toAssetSelect: 'select[name="asset_to"]',
        fromAssetSelect: 'select[name="asset_from"]',
        form: 'form',
    },

    events: {
        'change @ui.modeSelect': 'onModeChange',
        'keydown @ui.deltaInput': 'onDeltaInputKeyDown',
    },

    modelEvents: {
        'change:record': 'render'
    },

    serializeModel: function() {
        let renderData = TabPanelView.prototype.serializeModel.apply(this, arguments);
        renderData.record = renderData.record ?
            renderData.record.serialize() :
            this._buildNewRecordRenderData();
        renderData.assets = minicash.collections.assets.serialize();
        return renderData;
    },

    _buildNewRecordRenderData: function() {
        let nowStr = moment().format(minicash.CONTEXT.user.dtFormat);
        return {
            'created_dt': nowStr
        };
    },

    onRender: function() {
        this.initializeValidator();
        this.renderDateTimePicker();
        this.renderTagsSelect();
        this.renderModeSelectState();
    },

    initializeValidator: function() {
        let RECORD_MODES = minicash.CONTEXT.RECORD_MODES;

        this.validator = this.getUI('form').validate({
            rules: {
                dtStamp: {required: true},
                delta: {number: true, required: true},
            },
            messages: {
                dtStamp: tr("Please enter a valid date/time"),
                delta: tr("Please enter a valid expense value"),
            },
        });
    },

    renderDateTimePicker: function() {
        let options = {
            showTodayButton: true,
            allowInputToggle: true,
            format: minicash.CONTEXT.user.dtFormat,
            locale: utils.getLocale(),
        };

        let $dtInput = this.getUI('dtStampInput');
        let dtStampInputWrapper = $dtInput.parent();
        dtStampInputWrapper.datetimepicker(options);
    },

    renderTagsSelect: function() {
        let data = minicash.collections.tags.map((it) => {
            let name = it.get('name');
            return {id: name, text: name};
        });

        let opts = {
            data: data,
            allowClear: true,
            placeholder: '',
            tags: true,
        };

        this.getUI('tagsSelect').select2(opts);
    },

    onDeltaInputKeyDown: function(e) {
        switch (e.keyCode) {
        case utils.KEYS.ENTER: this.calculateDelta(); break;
        case utils.KEYS.ESCAPE: this.restoreCalculatedDelta(); break;
        }
    },

    calculateDelta: function() {
        let deltaTxt = this.getUI('deltaInput').val();
        let newDeltaTxt = deltaTxt;

        try {
            newDeltaTxt = eval(deltaTxt);
        } catch (err) {

        }

        if (!isNaN(newDeltaTxt)) {
            // if result is number format it to 3-point decimal
            this.previousDeltaTxt = deltaTxt;
            let formattedDeltaTxt = new Decimal(newDeltaTxt).toFixed(3).toString();
            newDeltaTxt = formattedDeltaTxt;
        }

        this.getUI('deltaInput').val(newDeltaTxt);
    },

    restoreCalculatedDelta: function() {
        if (this.previousDeltaTxt != null) {
            let currentDeltaTxt = this.getUI('deltaInput').val();
            this.getUI('deltaInput').val(this.previousDeltaTxt);
            this.previousDeltaTxt = currentDeltaTxt;
        }
    },

    onModeChange: function(e) {
        this.renderModeSelectState($(e.target).val());
    },

    renderModeSelectState: function(mode) {
        mode = mode || this.getUI('modeSelect').val();
        mode = parseInt(mode);

        let RECORD_MODES = minicash.CONTEXT.RECORD_MODES;

        let showTo = false;
        let showFrom = false;

        let $fromAssetSelect = this.getUI('fromAssetSelect');
        let $toAssetSelect = this.getUI('toAssetSelect');

        $toAssetSelect.rules('remove', 'required');
        $fromAssetSelect.rules('remove', 'required');

        switch (mode) {
        case RECORD_MODES.INCOME.value:
            showTo = true;
            $toAssetSelect.rules('add', 'required');
            break;
        case RECORD_MODES.EXPENSE.value:
            showFrom = true;
            $fromAssetSelect.rules('add', 'required');
            break;
        case RECORD_MODES.TRANSFER.value:
            showTo = showFrom = true;
            $toAssetSelect.rules('add', 'required');
            $fromAssetSelect.rules('add', 'required');
            break;
        default:
            throw 'Invalid record mode value';
        }

        $fromAssetSelect.parentsUntil('form', '.form-group').toggle(showFrom);
        $toAssetSelect.parentsUntil('form', '.form-group').toggle(showTo);
    },

    _collectFormData: function() {
        let NO_DATA = {};
        let RECORD_MODES = minicash.CONTEXT.RECORD_MODES;

        if (!this.validator.form()) {
            return NO_DATA;
        }

        let formData = this.getUI('form').serializeForm();
        formData.tags = [];
        formData.tags_names = this.getUI('tagsSelect').select2().val();

        // mode either from Form Data, or if not available (control disabled, i.e. editing)
        // - from existing record which is being edited
        let mode = formData.mode || this.model.get('record').get('mode');
        switch(parseInt(mode)) {
        case RECORD_MODES.INCOME.value: formData.asset_from = null; break;
        case RECORD_MODES.EXPENSE.value: formData.asset_to = null; break;
        case RECORD_MODES.TRANSFER.value: break; // both assets are used
        default: throw 'Invalid record mode';
        }
        formData.mode = mode;
        return formData;
    },

    saveForm: function() {
        let saveData = this._collectFormData();
        if (_.isEmpty(saveData)) {
            return utils.rejectedPromise();
        }

        let opts = {wait: true};
        let record = this.model.get('record');
        if (record.id) {
            opts = _.extend(opts, {patch: true});
        }

        let saveDfd = record.save(saveData, opts);

        saveDfd.done(() => {
            // this.model.set('record', record);
            recordsChannel.trigger('model:save', record);
        }).fail((response) => {
            this.validator.showErrors(response.responseJSON);
        });

        return saveDfd.promise();
    },
});


let RecordEntryRowView = Mn.View.extend({
    tagName: 'tr',
    template: require('templates/tab_record/multi_entry_tr.hbs'),
});


let EntriesTableView = Mn.NextCollectionView.extend({
    tagName: 'table',
    className: 'table table-striped',

    attributes: {
        "data-spec": "records-table",
        "cellspacing": "0",
    },

    childView: RecordEntryRowView,

    onRender: function() {
        let template = require('templates/tab_record/multi_entry_thead.hbs');
        let $tableHead = $(template());
        this.$el.prepend($tableHead);
    },

    onChildviewRecordSelectedChange: function(childView, e) {
        this.triggerMethod('selected:records:change', this.getSelectedRecords());
    },

    getSelectedRecords: function() {
        let selectedRecords = this.children.filter((c) => c.isSelected());
        let selectedRecordModels = _.map(selectedRecords, 'model');
        return selectedRecordModels;
    },
});
