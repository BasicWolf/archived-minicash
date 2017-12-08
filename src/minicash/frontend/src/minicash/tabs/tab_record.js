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
    defaults() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            viewClass: RecordTabPanelView,
            recordId: null,
            viewMode: VIEW_MODE.SINGLE,
        });
    },

    initialize() {
        if (this.get('recordId')) {
            this.set('title', tr('Edit record'));
            this.set('viewMode', VIEW_MODE.SINGLE);
        } else if (this.get('recordsIds')) {
            this.set('title', tr('Edit records'));
            this.set('viewMode', VIEW_MODE.MULTI);
        } else {
            this.set('title', tr('New record'));
        }

        TabModel.prototype.initialize.apply(this, arguments);
    },
});


export let DeltaEntryCalculatorBehavior = views.MinicashBehavior.extend({
    ui: {
        deltaInput: 'input[data-spec="delta-input"]',
    },

    events: {
        'keydown @ui.deltaInput': 'onDeltaInputKeyDown',
    },

    onDeltaInputKeyDown: function(e) {
        switch (e.keyCode) {
        case utils.KEYS.ENTER: this.calculateDelta(); break;
        case utils.KEYS.ESCAPE: this.restoreCalculatedDelta(); break;
        }
    },

    calculateDelta() {
        let $deltaInput = this.getUI('deltaInput');
        let deltaTxt = $deltaInput.val();
        let newDeltaTxt = deltaTxt;

        try {
            newDeltaTxt = eval(deltaTxt); // jshint ignore:line
        } catch (err) {

        }

        if (!isNaN(newDeltaTxt)) {
            // if result is number format it to 3-point decimal
            this.previousDeltaTxt = deltaTxt;
            let formattedDeltaTxt = new Decimal(newDeltaTxt).toFixed(3).toString();
            newDeltaTxt = formattedDeltaTxt;
        }

        $deltaInput.val(newDeltaTxt);
        $deltaInput.trigger("input");
    },

    restoreCalculatedDelta() {
        if (this.previousDeltaTxt != null) {
            let $deltaInput = this.getUI('deltaInput');

            let currentDeltaTxt = $deltaInput.val();
            $deltaInput.val(this.previousDeltaTxt);
            $deltaInput.trigger("input");

            this.previousDeltaTxt = currentDeltaTxt;
        }
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
        panelContent: {el: '[data-spec="panel-content"]'},
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
        'tab:shown': 'onTabShown',
    },

    onTabShown() {
        let currentEntriesView = this.getRegion('panelContent').currentView;
        currentEntriesView.defaultFocus();
    },

    initialize() {
        // load bound record
        if (this.model.get('recordId')) {
            minicash.status.show(tr('Loading record'));

            let record = new models.Record({pk: this.model.get('recordId')});
            record.fetch().then(() => {
                this.model.set('record', record);
            }).always(() => {
                minicash.status.hide();
            });
        } else {
            this.model.set('record', new models.Record());
        }
    },

    onRender() {
        this.renderEntriesFormView();
        this.renderSingleMultiSwitch();
    },

    renderEntriesFormView() {
        if (this.model.get('viewMode') === VIEW_MODE.SINGLE) {
            this.showChildView('panelContent',
                               new SingleEntryFormView({model: this.model}));
        } else {
            this.showChildView('panelContent',
                               new MultiEntryFormView({model: this.model}));
        }
    },

    renderSingleMultiSwitch() {
        this.getUI('singleMultiChk').bootstrapSwitch({
            state: this.model.get('viewMode') == VIEW_MODE.SINGLE,
        });
    },

    onSingleMultiChkChange: function(e, state) {
        let currentEntriesView = this.getRegion('panelContent').currentView;
        let record = this.model.get('record');
        record.set(currentEntriesView.getCommonViewData());
        this.model.set('viewMode', state ? VIEW_MODE.SINGLE: VIEW_MODE.MULTI);
    },

    onSaveBtnClick() {
        this.saveForm().then(() => {
            this.model.destroy();
        });
    },

    onSaveAddSimilarBtnClick() {
        this.saveForm().done(() => {
            this._renderNewRecordSimilarToOld();
        });
    },

    _renderNewRecordSimilarToOld() {
        let newRecord = this.model.get('record').clone();
        newRecord.unset(newRecord.idAttribute, {silent: true});
        newRecord.unset('delta', {silent: true});
        this.model.set('record', newRecord);
    },

    onSaveAddAnotherBtnClick() {
        this.saveForm().done(() => {
            this.model.unset('record');
        });
    },

    onCancelBtnClick() {
        this.model.destroy();
    },

    saveForm() {
        let dfd = this.getChildView('panelContent').saveForm();

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

    lockControls() {
        return this.uiDisable(['saveBtn', 'cancelBtn']);
    },

    unlockControls() {
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

    renderDateTimePicker() {
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

    getCommonViewData() {
        let formData = this.getUI('form').serializeForm();
        formData = this._updateFormDataMode(formData);
        let commonData = _.pick(formData, ['asset_from', 'asset_to', 'created_dt', 'mode', 'tags']);
        return commonData;
    },

    _updateFormDataMode: function(formData) {
        /* Mode either from Form Data, or if not available (control disabled, i.e. editing)
           - from existing record which is being edited */
        let RECORD_MODES = minicash.CONTEXT.RECORD_MODES;

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

    onModeChange: function(e) {
        this.renderModeSelectState($(e.target).val());
    },
};


function renderTagsSelect($select) {
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

    $select.select2(opts);
}


let SingleEntryFormView = views.MinicashView.extend({
    behaviors: [DeltaEntryCalculatorBehavior],

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
    },

    modelEvents: {
        'change:record': 'render'
    },

    serializeModel() {
        let renderData = TabPanelView.prototype.serializeModel.apply(this, arguments);
        renderData.record = !_.isEmpty(renderData.record) && !renderData.record.isEmpty() ?
            renderData.record.serialize() :
            this._buildNewRecordRenderData();
        renderData.assets = minicash.collections.assets.serialize();
        return renderData;
    },

    _buildNewRecordRenderData() {
        let nowStr = moment().format(minicash.CONTEXT.user.dtFormat);
        return {
            'created_dt': nowStr
        };
    },

    onRender() {
        this.initializeValidator();
        this.renderDateTimePicker();
        this.renderTagsSelect();
        this.renderModeSelectState();
    },

    onAttach() {
        this.defaultFocus();
    },

    initializeValidator() {
        this.validator = this.getUI('form').validate();
    },

    renderTagsSelect() {
        renderTagsSelect(this.getUI('tagsSelect'));
    },

    saveForm() {
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

    _collectFormData() {
        let NO_DATA = {};

        if (!this.validator.form()) {
            return NO_DATA;
        }

        let formData = this.getUI('form').serializeForm();
        formData.tags = [];
        formData.tags_names = this.getUI('tagsSelect').select2().val();

        formData = this._updateFormDataMode(formData);
        return formData;
    },

    defaultFocus() {
        this.getUI('deltaInput').focus();
    }
});
_.extend(SingleEntryFormView.prototype, CommonFormViewBase);


let MultiEntryFormView = views.MinicashView.extend({
    collection: null,

    collectionEvents: {
        update: 'updateTotalDelta'
    },

    template: require('templates/tab_record/multi_entry_form.hbs'),

    ui: {
        modeSelect: 'select[name="mode"]',
        dtStampInput: 'input[name="created_dt"]',
        toAssetSelect: 'select[name="asset_to"]',
        fromAssetSelect: 'select[name="asset_from"]',
        commonTagsSelect: 'select[name="tags"]',
        addEntryBtn: 'button[data-spec="add-entry"]',
        form: 'form',
        totalDelta: 'span[data-spec="total-delta"]',
    },

    regions: {
        entriesTBody: {
            el: 'tbody[data-spec="multi-entries-tbody"]',
            replaceElement: true,
        }
    },

    events: {
        'change @ui.modeSelect': 'onModeChange',
        'click @ui.addEntryBtn': 'onAddEntryBtnClick',
    },

    initialize() {
        let recordsIds = this.model.get('recordsIds') || [];
        this.collection = new models.PageableRecords([]);
        this.collection.state.pageSize = 100; console.log('TODO: 100');

        if (recordsIds.length) {
            this.collection.queryArgs = {
                'pk': this.model.get('recordsIds')
            };
            this.collection.getPage(1);
        }
    },

    onAttach() {
        this.defaultFocus();
    },

    onAddEntryBtnClick() {
        this.collection.add({});
    },

    onRender() {
        this.showChildView('entriesTBody', new EntriesTBodyView({
            collection: this.collection,
        }));

        this.collection.add([{}, ]);
        this.updateValidator();

        this.renderDateTimePicker();
        this.renderCommonTagsSelect();
        this.renderModeSelectState();
    },

    updateValidator() {
        this.validator = this.getUI('form').validate();
    },

    renderCommonTagsSelect() {
        renderTagsSelect(this.getUI('commonTagsSelect'));
    },

    serializeModel() {
        let renderData = TabPanelView.prototype.serializeModel.apply(this, arguments);
        renderData.record = !renderData.record.isEmpty() ?
            renderData.record.serialize() :
            this._buildNewRecordRenderData();
        renderData.assets = minicash.collections.assets.serialize();
        return renderData;
    },

    _buildNewRecordRenderData() {
        let nowStr = moment().format(minicash.CONTEXT.user.dtFormat);
        return {
            'created_dt': nowStr
        };
    },

    saveForm() {
        if (!this.validator.form()) {
            return utils.rejectedPromise();
        }

        this._collectAndSetRecordsData();

        let opts = {wait: true};
        let saveDfd = this.collection.save(opts);

        saveDfd.done(() => {
            this.collection.forEach((record) => {
                recordsChannel.trigger('model:save', record);
            });
        }).fail((response) => {
            this._showErrors(response.responseJSON);
        });

        return saveDfd.promise();
    },

    _collectAndSetRecordsData() {
        let RECORD_MODES = minicash.CONTEXT.RECORD_MODES;

        let formData = this.getUI('form').serializeForm();
        let commonData = this.getCommonViewData(formData);

        commonData.tags = [];
        commonData.tags_names = this.getUI('commonTagsSelect').select2().val();

        let tbodyView = this.getRegion('entriesTBody').currentView;

        let tagsNamesMergeCustomizer = function (objValue, srcValue, key) {
            if (key === 'tags_names' && _.isArray(objValue)) {
                return _.uniq(objValue.concat(srcValue));
            }
            return undefined;
        };

        this.collection.forEach((rec) => {
            let entryRowView = tbodyView.children.findByModelCid(rec.cid);
            let recordData = _.mergeWith({}, commonData, entryRowView.getFormData(),
                                         tagsNamesMergeCustomizer);
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
    },

    onChildviewChildviewDeltaChange() {
        this.updateTotalDelta();
    },

    updateTotalDelta() {
        let tbodyView = this.getRegion('entriesTBody').currentView;

        let totalDeltaTxt = '';
        try {
            let totalDelta =  this.collection.reduce((memo, rec) => {
                let entryRowView = tbodyView.children.findByModelCid(rec.cid);
                if (!entryRowView) {
                    return memo;
                }

                let deltaTxt = entryRowView.getDeltaInputText() || "0";
                let delta = new Decimal(deltaTxt).toFixed(3);
                return memo.add(delta);
            }, new Decimal(0));

            totalDeltaTxt = utils.decimalToString(totalDelta);
        } catch (e) {

        }

        this.getUI('totalDelta').text(totalDeltaTxt);
    },

    defaultFocus() {
        let entriesTBody = this.getChildView('entriesTBody');
        entriesTBody.focusLastChild();
    },
});
_.extend(MultiEntryFormView.prototype, CommonFormViewBase);


let RecordEntryRowView = views.MinicashView.extend({
    behaviors: [DeltaEntryCalculatorBehavior],

    tagName: 'tr',

    template: require('templates/tab_record/multi_entry_row.hbs'),

    ui: {
        tagsSelect: 'select[data-spec="tags-select"]',
        deltaInput: 'input[data-spec="delta-input"]',
        descriptionInput: 'input[data-spec="description-input"]',
        removeEntryBtn: 'button[data-spec="remove-entry"]',
    },

    events: {
        'click @ui.removeEntryBtn': 'onRemoveEntryBtnClick'
    },

    triggers: {
        'input @ui.deltaInput': 'deltaChange',
    },

    onRender() {
        this.renderTagsSelect();
    },

    renderTagsSelect() {
        renderTagsSelect(this.getUI('tagsSelect'));
    },

    serializeModel() {
        let recordData = views.MinicashView.prototype.serializeModel.apply(this, arguments);
        recordData._cid = this.model.cid;
        recordData._index = this.model.collection.indexOf(this.model);
        return recordData;
    },

    onRemoveEntryBtnClick() {
        this.model.collection.remove(this.model);
    },

    getFormData() {
        return {
            tags: [],
            tags_names: this.getUI('tagsSelect').select2().val(),
            delta: this.getDeltaInputText(),
            description: this.getUI('descriptionInput').val(),
        };
    },

    getDeltaInputText() {
        return this.getUI('deltaInput').val();
    },

    focusDeltaInput() {
        this.getUI('deltaInput').focus();
    },
});


let EntriesTBodyView = Mn.NextCollectionView.extend({
    tagName: 'tbody',

    attributes: {
        'data-spec': 'multi-entries-tbody'
    },

    childView: RecordEntryRowView,

    onRenderChildren() {
        this.focusLastChild();
    },

    focusLastChild() {
        this.children.last().focusDeltaInput();
    },
});
