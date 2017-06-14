'use strict';

/* global $,_,moment,minicash,require,tr */

import 'tagsinput';
import 'typeahead';

import {TabPanelView, TabModel} from 'tabbar';
import * as utils from 'utils';


export let RecordTab = TabModel.extend({
    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            title: 'New record',
            name: 'new_record_' + utils.generateId(),
            viewClass: RecordTabPanelView,
            record: null,
        });
    }
});


export let RecordTabPanelView = TabPanelView.extend({
    validator: null,

    template: require('templates/tab_record.hbs'),

    ui: {
        saveBtn: 'button[data-spec="save"]',
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
        'click @ui.cancelBtn': 'onCancelBtnClick',
        'change @ui.modeSelect': 'onModeChange',
        'keydown @ui.deltaInput': 'onDeltaInputKeyDown',
    },

    serializeModel: function() {
        let renderData = TabPanelView.prototype.serializeModel.apply(this, arguments);
        renderData.record = (renderData.record && renderData.record.serialize() || {});
        renderData.assets = minicash.collections.assets.serialize();
        return renderData;
    },

    onRender: function() {
        this.initializeDateTimePicker();
        this.initializeValidator();
        this.renderModeSelectState();
        this.renderTags();
    },

    initializeDateTimePicker: function() {
        let options = {
            showTodayButton: true,
            allowInputToggle: true,
            format: minicash.CONTEXT.user.dtFormat,
        };

        let $dtInput = this.getUI('dtStampInput');
        let dtStampInputWrapper = $dtInput.parent();
        dtStampInputWrapper.datetimepicker(options);
        // set initial value in textbox
        if ($dtInput.val() === '') {
            let nowStr = moment().format(options.format);
            this.getUI('dtStampInput').val(nowStr);
        }
    },

    initializeValidator: function() {
        let RECORD_MODES = minicash.CONTEXT.RECORD_MODES;

        this.validator = this.getUI('form').validate({
            rules: {
                dtStamp: {required: true},
                delta: {required: true},
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
        this.previousDeltaTxt = deltaTxt;
        this.getUI('deltaInput').val(eval(deltaTxt));
    },

    restoreCalculatedDelta: function() {
        if (this.previousDeltaTxt == null) {
            this.getUI('deltaInput').val(this.previousDeltaTxt);
            this.previousDeltaTxt = null;
        }
    },

    onSaveBtnClick: function() {
        this.saveForm();
    },

    onCancelBtnClick: function() {
        this.model.destroy();
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

    renderTags: function() {
        this.getUI('tagsInput').tagsinput({
            tagClass: 'label label-primary',
            typeaheadjs: {
                displayKey: 'name',
                valueKey: 'name',
                source: minicash.collections.tags.bloodhound.adapter(),
            },
        });
    },

    saveForm: function() {
        let self = this;
        let saveData = this._prepareSaveData();
        if (_.isEmpty(saveData)) {
            return;
        }

        let dfd = $.Deferred(() => {
            minicash.status.show();
        });
        dfd.then(() => {
            self.model.destroy();
        }).fail(() => {
            self.unlockControls();
        }).always(() => {
            minicash.status.hide();
        });

        let saveOptions = {
            wait: true,
            success: () => dfd.resolve(),
            error: () => dfd.reject(),
        };

        let record = this.model.get('record');
        if (record) {
            record.save(saveData, saveOptions);
        } else {
            minicash.collections.records.create(saveData, saveOptions);
        }
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


