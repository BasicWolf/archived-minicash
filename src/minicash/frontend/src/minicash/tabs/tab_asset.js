'use strict';

/* global $,_,moment,minicash,require,tr */

import {TabPanelView, TabModel} from 'tabbar';
import * as utils from 'utils';


export let AssetTab = TabModel.extend({
    constructor: function(attributes) {
        if (attributes.adding) {
            attributes['title'] = tr('New asset');
        } else {
            attributes['title'] = tr('Edit asset');
        }

        TabModel.apply(this, arguments);
    },

    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            name: 'asset_' + utils.generateId(),
            adding: false,
            viewClass: AssetTabPanelView,
        });
    },

    serializeModel: function() {
        let renderData = TabPanelView.prototype.serializeModel.apply(this, arguments);


        return renderData;
    }
});


export let AssetTabPanelView = TabPanelView.extend({
    validator: null,

    template: require('templates/tab_assets/tab_asset.hbs'),

    ui: {
        saveBtn: 'button[data-spec="save"]',
        cancelBtn: 'button[data-spec="cancel"]',
        form: 'form',
    },

    events: {
        'click @ui.saveBtn': 'onSaveBtnClick',
        'click @ui.cancelBtn': 'onCancelBtnClick',
    },

    serializeModel: function() {
        let renderData = TabPanelView.prototype.serializeModel.apply(this, arguments);
        renderData.asset = (renderData.asset && renderData.asset.serialize() || {});

        return renderData;
    },

    onRender: function() {
        this.initializeValidator();
    },

    initializeValidator: function() {
        this.validator = this.getUI('form').validate({
            rules: {
                name: {required: true},
                saldo: {required: true},
            },
            messages: {
                name: tr("Please enter a valid name"),
                saldo: tr("Please enter an initial saldo"),
            },
        });
    },

    onSaveBtnClick: function() {
        this.saveForm();
    },

    onCancelBtnClick: function() {
        this.model.destroy();
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

        let asset = this.model.get('asset');
        if (asset) {
            asset.save(saveData, saveOptions);
        } else {
            minicash.collections.records.create(saveData, saveOptions);
        }
    },

    _prepareSaveData: function() {
        let NO_DATA = {};

        if (!this.validator.form()) {
            return NO_DATA;
        }

        let formData = this.getUI('form').serializeForm();
        return formData;
    },

    lockControls: function() {
        return this.uiDisable(['saveBtn', 'cancelBtn']);
    },

    unlockControls: function() {
        return this.uiEnable(['saveBtn', 'cancelBtn']);
    },
}); // AssetTabPanelView
