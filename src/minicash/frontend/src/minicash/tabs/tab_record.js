'use strict';

/* global $,_,moment,minicash,require */

import 'corejs-typeahead';
import 'bootstrap-switch';
import Decimal from 'decimal.js';
import Radio from 'backbone.radio';
import Mn from 'backbone.marionette';

import * as models from 'minicash/models';
import * as utils from 'minicash/utils';
import * as views from 'minicash/views';
import {tr} from 'minicash/utils';
import {TabPanelView, TabModel} from 'components/tabbar';


let recordsChannel = Radio.channel('records');

let VIEW_MODE = {
    SINGLE: 1,
    MULTI: 2,
};

export let RecordTab = TabModel.extend({
    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            viewClass: RecordTabPanelView,
            recordId: null,
            viewMode: VIEW_MODE.MULTI,
        });
    },

    initialize: function() {
        let title = this.get('recordId') ? tr('Edit record') : tr('New record');
        this.set('title', title);
        TabModel.prototype.initialize.apply(this, arguments);
    },
});


export let RecordTabPanelView = TabPanelView.extend({
    validator: null,

    template: require('templates/tab_record/tab_record.hbs'),

    ui: {
        saveBtn: 'button[data-spec="save"]',
        saveAddSimilarBtn: 'a[data-spec="save-add-similar"]',
        saveAddAnotherBtn: 'a[data-spec="save-add-another"]',
        cancelBtn: 'button[data-spec="cancel"]',
        singleMultiChk: 'input[data-spec="single-multi"]',
    },

    regions: {
        entriesRegion: {el: '[data-spec="entries-region"]'},
    },

    events: {
        'click @ui.saveBtn': 'onSaveBtnClick',
        'click @ui.saveAddSimilarBtn': 'onSaveAddSimilarBtnClick',
        'click @ui.saveAddAnotherBtn': 'onSaveAddAnotherBtnClick',
        'click @ui.cancelBtn': 'onCancelBtnClick',
        'switchChange.bootstrapSwitch @ui.singleMultiChk': 'onSingleMultiChkChange',
    },

    modelEvents: {
        'change:record': 'render',
        'change:viewMode': 'renderEntriesFormView',
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
        this.renderEntriesFormView();
        this.renderSingleMultiSwitch();
    },

    renderEntriesFormView: function() {
        if (this.model.get('viewMode') === VIEW_MODE.SINGLE) {
            this.showChildView('entriesRegion',
                               new SingleEntryFormView({model: this.model}));
        } else {
            this.showChildView('entriesRegion',
                               new MultiEntryFormView({model: this.model}));
        }
    },

    renderSingleMultiSwitch: function() {
        this.getUI('singleMultiChk').bootstrapSwitch({
            onSwitchChange: this.onSingleMultiToggle,
            state: this.model.get('viewMode') == VIEW_MODE.SINGLE,
        });
    },

    onSingleMultiChkChange: function(e, state) {
        this.model.set('viewMode', state ? VIEW_MODE.SINGLE: VIEW_MODE.MULTI);
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

    onSingleMultiToggle: function(evt, state) {

    },

    lockControls: function() {
        return this.uiDisable(['saveBtn', 'cancelBtn']);
    },

    unlockControls: function() {
        return this.uiEnable(['saveBtn', 'cancelBtn']);
    },
}); // RecordTabPanelView


let CommonFormViewBase = {
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

    onModeChange: function(e) {
        this.renderModeSelectState($(e.target).val());
    },
};


let SingleEntryFormView = views.MinicashView.extend({
    template: require('templates/tab_record/single_entry_form.hbs'),

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
        renderData.record = !renderData.record.isEmpty() ?
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
        this.validator = this.getUI('form').validate();
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
            recordsChannel.trigger('model:save', record);
        }).fail((response) => {
            this.validator.showErrors(response.responseJSON);
        });

        return saveDfd.promise();
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
});
_.extend(SingleEntryFormView.prototype, CommonFormViewBase);


let MultiEntryFormView = views.MinicashView.extend({
    collection: null,

    collectionEvents: {
        'change': 'updateValidator'
    },

    template: require('templates/tab_record/multi_entry_form.hbs'),

    ui: {
        modeSelect: 'select[name="mode"]',
        dtStampInput: 'input[name="created_dt"]',
        toAssetSelect: 'select[name="asset_to"]',
        fromAssetSelect: 'select[name="asset_from"]',
        addEntryBtn: 'button[data-spec="add-entry"]',
        form: 'form',
    },

    regions: {
        entriesTBody: {
            el: 'tbody[data-spec="record-multi-entries-tbody"]',
            replaceElement: true,
        }
    },

    events: {
        'change @ui.modeSelect': 'onModeChange',
        'click @ui.addEntryBtn': 'onAddEntryBtnClick',
    },

    initialize: function() {
        this.collection = new models.Records();
    },

    onAddEntryBtnClick: function() {
        this.collection.add({});
    },

    onRender: function() {
        this.showChildView('entriesTBody', new EntriesTBodyView({
            collection: this.collection,
        }));

        this.collection.add([{}, ]);
        this.updateValidator();

        this.renderDateTimePicker();
        this.renderModeSelectState();
    },

    updateValidator: function() {
        this.validator = this.getUI('form').validate();
    },

    serializeModel: function() {
        let renderData = TabPanelView.prototype.serializeModel.apply(this, arguments);
        renderData.record = !renderData.record.isEmpty() ?
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

    saveForm: function() {
        if (!this.validator.form()) {
            return utils.rejectedPromise();
        }

        this._collectAndSetRecordsData();

        let opts = {wait: true};
        let saveDfd = this.collection.save(opts);

        saveDfd.done(() => {
            debugger;
        }).fail((response) => {
            this._showErrors(response.responseJSON);
        });

        return saveDfd.promise();
    },

    _collectAndSetRecordsData: function() {
        let RECORD_MODES = minicash.CONTEXT.RECORD_MODES;

        let formData = this.getUI('form').serializeForm();
        let commonData = _.pick(formData, ['asset_from', 'asset_to', 'created_dt', 'mode']);

        // mode either from Form Data, or if not available (control disabled, i.e. editing)
        // - from existing record which is being edited
        let mode = commonData.mode || this.model.get('record').get('mode');
        switch(parseInt(mode)) {
        case RECORD_MODES.INCOME.value: commonData.asset_from = null; break;
        case RECORD_MODES.EXPENSE.value: commonData.asset_to = null; break;
        case RECORD_MODES.TRANSFER.value: break; // both assets are used
        default: throw 'Invalid record mode';
        }
        commonData.mode = mode;

        let tbodyView = this.getRegion('entriesTBody').currentView;
        this.collection.forEach((rec) => {
            let entryRowView = tbodyView.children.findByModelCid(rec.cid);
            let recordData = _.assign({}, commonData, entryRowView.getFormData());
            rec.set(recordData);
        });
    },

    _showErrors: function(errorData) {
        if (!_.isArray(errorData)) {
            return;
        }

        if (errorData.length == 1 && errorData[0].non_field_errors) {
            this.validator.showErrors(errorData[0]);
            return;
        }

        let fieldsErrors = {};
        for (let recordErrors of _.zip(this.collection.models, errorData)) {
            let [record, errors] = recordErrors;
            for (let field in errors) {
                let errName = `${field}_${record.cid}`;
                fieldsErrors[errName] = errors[field];
            }
        }

        this.validator.showErrors(fieldsErrors);
    }
});
_.extend(MultiEntryFormView.prototype, CommonFormViewBase);


let RecordEntryRowView = views.MinicashView.extend({
    tagName: 'tr',

    template: require('templates/tab_record/multi_entry_row.hbs'),

    collectionEvents: {
        //'change': 'initializeValidator'
    },

    ui: {
        tagsSelect: 'select[data-spec="tags-select"]',
        deltaInput: 'input[data-spec="delta-input"]',
        descriptionInput: 'input[data-spec="description-input"]',
        removeEntryBtn: 'button[data-spec="remove-entry"]',
    },

    events: {
        'click @ui.removeEntryBtn': 'onRemoveEntryBtnClick'
    },

    onRender: function() {
        this.renderTagsSelect();
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

    serializeModel: function() {
        let recordData = views.MinicashView.prototype.serializeModel.apply(this, arguments);
        recordData._cid = this.model.cid;
        recordData._index = this.model.collection.indexOf(this.model);
        return recordData;
    },

    onRemoveEntryBtnClick: function() {
        this.model.collection.remove(this.model);
    },

    getFormData: function() {
        return {
            tags: [],
            tags_names: this.getUI('tagsSelect').select2().val(),
            delta: this.getUI('deltaInput').val(),
            description: this.getUI('descriptionInput').val(),
        };
    },
});


let EntriesTBodyView = Mn.NextCollectionView.extend({
    tagName: 'tbody',

    childView: RecordEntryRowView,

    onChildviewRecordSelectedChange: function(childView, e) {
        this.triggerMethod('selected:records:change', this.getSelectedRecords());
    },

    getSelectedRecords: function() {
        let selectedRecords = this.children.filter((c) => c.isSelected());
        let selectedRecordModels = _.map(selectedRecords, 'model');
        return selectedRecordModels;
    },
});
