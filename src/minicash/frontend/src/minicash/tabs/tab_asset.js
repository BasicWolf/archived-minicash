'use strict';

/* global $,_,minicash,require,tr */

import * as models from 'minicash/models';
import * as utils from 'minicash/utils';
import {TabPanelView, TabModel} from 'components/tabbar';


export let AssetTab = TabModel.extend({
    initialize: function() {
        let title = this.get('assetId') ? tr('Edit asset') : tr('New asset');
        this.set('title', title);
        TabModel.prototype.initialize.apply(this, arguments);
    },

    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            viewClass: AssetTabPanelView,
            assetId: null
        });
    },
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

    modelEvents: {
        'change:asset': 'render'
    },

    initialize: function() {
        // load bound asset
        if (this.model.get('assetId')) {
            let asset = new models.Asset({pk: this.model.get('assetId')});
            asset.fetch().then(() => {
                this.model.set('asset', asset);
            });
        }
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
                balance: {number: true, required: true},
            },
            messages: {
                name: tr("Please enter a valid name"),
                balance: tr("Please enter an initial balance"),
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
        let saveData = this._collectFormData();
        if (_.isEmpty(saveData)) {
            return;
        }

        let dfd = $.Deferred(() => {
            minicash.status.show();
        });
        dfd.then(() => {
            this.model.destroy();
        }).fail((errors) => {
            this.validator.showErrors(errors);
            this.unlockControls();
        }).always(() => {
            minicash.status.hide();
        });

        let saveOptions = {
            wait: true,
            success: () => dfd.resolve(),
            error: (model, response, options) => {
                dfd.reject(response.responseJSON);
            },
        };

        let asset = this.model.get('asset');
        if (asset) {
            asset.save(saveData, saveOptions);
        } else {
            minicash.collections.assets.create(saveData, saveOptions);
        }
    },

    _collectFormData: function() {
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
