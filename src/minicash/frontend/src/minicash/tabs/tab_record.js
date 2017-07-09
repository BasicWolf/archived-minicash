'use strict';

/* global $,_,moment,minicash,require,tr */

import 'tagsinput';
import 'corejs-typeahead';
import Decimal from 'decimal.js';

import * as tabbar from 'components/tabbar';
import * as models from 'models';
import * as utils from 'utils';


export let RecordTab = tabbar.TabModel.extend({
    defaults: function() {
        let parentDefaults = tabbar.TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            title: 'New record',
            name: 'new_record_' + utils.generateId(),
            viewClass: RecordTabPanelView,
            record: null,
        });
    }
});


export let RecordTabPanelView = tabbar.TabPanelView.extend({
    uiInitialized: false,
    validator: null,

    template: require('templates/tab_records/tab_record.hbs'),

    ui: {
        saveBtn: 'button[data-spec="save"]',
        saveAddSimilarBtn: 'a[data-spec="save-add-similar"]',
        saveAddAnotherBtn: 'a[data-spec="save-add-another"]',
        cancelBtn: 'button[data-spec="cancel"]',
        modeSelect: 'select[name="mode"]',
        dtStampInput: 'input[name="dt_stamp"]',
        deltaInput: 'input[name="delta"]',
        tagsInput: 'input[name="tags"]',
        toAssetSelect: 'select[name="asset_to"]',
        fromAssetSelect: 'select[name="asset_from"]',
        form: 'form',
    },

    events: {
        'click @ui.saveBtn': 'onSaveBtnClick',
        'click @ui.saveAddSimilarBtn': 'onSaveAddSimilarBtnClick',
        'click @ui.saveAddAnotherBtn': 'onSaveAddAnotherBtnClick',
        'click @ui.cancelBtn': 'onCancelBtnClick',
        'change @ui.modeSelect': 'onModeChange',
        'keydown @ui.deltaInput': 'onDeltaInputKeyDown',
    },

    serializeModel: function() {
        let renderData = tabbar.TabPanelView.prototype.serializeModel.apply(this, arguments);
        renderData.record = renderData.record ?
            renderData.record.serialize() :
            this._buildNewRecordRenderData();
        renderData.assets = minicash.collections.assets.serialize();
        return renderData;
    },

    _buildNewRecordRenderData: function() {
        let nowStr = moment().format(minicash.CONTEXT.user.dtFormat);
        return {
            'dt_stamp': nowStr
        };
    },

    onRender: function() {
        this.initializeValidator();
        this.renderDateTimePicker();
        this.renderTagsInput();
        this.renderModeSelectState();
    },

    renderDateTimePicker: function() {
        let options = {
            showTodayButton: true,
            allowInputToggle: true,
            format: minicash.CONTEXT.user.dtFormat,
        };

        let $dtInput = this.getUI('dtStampInput');
        let dtStampInputWrapper = $dtInput.parent();
        dtStampInputWrapper.datetimepicker(options);
    },

    renderTagsInput: function() {
        this.getUI('tagsInput').tagsinput({
            tagClass: 'label label-primary',
            typeaheadjs: {
                displayKey: 'name',
                valueKey: 'name',
                source: minicash.collections.tags.bloodhound.adapter(),
            },
        });
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
            let formattedDeltaTxt = Decimal(newDeltaTxt).toFixed(3).toString();
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

        switch (mode) {
        case RECORD_MODES.INCOME.value:
            showTo = true;
            this.getUI('toAssetSelect').rules('add', 'required');
            break;
        case RECORD_MODES.EXPENSE.value:
            showFrom = true;
            this.getUI('fromAssetSelect').rules('add', 'required');
            break;
        case RECORD_MODES.TRANSFER.value:
            showTo = showFrom = true;
            this.getUI('fromAssetSelect').rules('add', 'required');
            this.getUI('toAssetSelect').rules('add', 'required');
            break;
        default:
            throw 'Invalid record mode value';
        };
        this.getUI('fromAssetSelect').parentsUntil('form', '.form-group').toggle(showFrom);
        this.getUI('toAssetSelect').parentsUntil('form', '.form-group').toggle(showTo);
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
        let currentRecord = this.model.get('record');
        let newRecordData = _.clone(currentRecord.attributes);
        delete newRecordData[currentRecord.idAttribute];
        delete newRecordData['delta'];

        let newRecord = new models.Record(newRecordData);

        this.model.set('record', newRecord);
        this.render();
    },

    onSaveAddAnotherBtnClick: function() {
        this.saveForm().done(() => {
            this.model.unset('record');
            this.render();
        });
    },

    onCancelBtnClick: function() {
        this.model.destroy();
    },

    saveForm: function() {
        let saveData = this._prepareSaveData();
        if (_.isEmpty(saveData)) {
            let emptyDfd = $.Deferred();
            emptyDfd.reject();
            return emptyDfd.promise();
        }

        let dfd = $.Deferred(() => {
            this.lockControls();
        });

        dfd.fail((errors) => {
            this.validator.showErrors(errors);
            this.unlockControls();
        });

        let saveOptions = {
            wait: true,
            success: () => dfd.resolve(),
            error: (model, response, options) => {
                dfd.reject(response.responseJSON);
            },
        };

        let record = this.model.get('record');
        if (record && record.id != null) {
            record.save(saveData, saveOptions);
        } else {
            let newRecord = minicash.collections.records.create(saveData, saveOptions);
            this.model.set('record', newRecord);
        }

        return dfd.promise();
    },

    _prepareSaveData: function() {
        let NO_DATA = {};
        let RECORD_MODES = minicash.CONTEXT.RECORD_MODES;

        if (!this.validator.form()) {
            return NO_DATA;
        }

        let formData = this.getUI('form').serializeForm();
        formData.tags = this.getUI('tagsInput').tagsinput('items');

        // mode either from Form Data, or if not available (control disabled, i.e. editing)
        // - from existing record which is being edited
        let mode = formData.mode || (this.model.get('record') && this.model.get('record').get('mode'));
        switch(parseInt(mode)) {
        case RECORD_MODES.INCOME.value: formData.asset_from = null; break;
        case RECORD_MODES.EXPENSE.value: formData.asset_to = null; break;
        case RECORD_MODES.TRANSFER.value: break; // both assets are used
        default: throw 'Invalid record mode';
        };
        return formData;
    },

    lockControls: function() {
        return this.uiDisable(['saveBtn', 'cancelBtn']);
    },

    unlockControls: function() {
        return this.uiEnable(['saveBtn', 'cancelBtn']);
    },
}); // RecordTabPanelView
