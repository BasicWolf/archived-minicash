'use strict';

/* global $,_,moment,minicash,require,tr */

import {TabPanelView, TabModel} from 'tabbar';
import * as utils from 'utils';


export let AssetsTab = TabModel.extend({
    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            title: 'Asset',
            name: 'assets_' + utils.generateId(),
            viewClass: AssetsTabPanelView,
        });
    }
});


export let AssetsTabPanelView = TabPanelView.extend({
    validator: null,

    template: require('templates/tab_assets.hbs'),

    ui: {
        saveBtn: 'button[data-spec="save"]',
        cancelBtn: 'button[data-spec="cancel"]',
        assetsSelect: 'select[name="assets"]',
        form: 'form',
    },

    events: {
        'click @ui.saveBtn': 'onSaveBtnClick',
        'click @ui.cancelBtn': 'onCancelBtnClick',
        'change @ui.assetsSelect': 'onAssetChange',
    },

    serializeModel: function() {
        let renderData = TabPanelView.prototype.serializeModel.apply(this, arguments);
        renderData.asset = (renderData.asset && renderData.asset.serialize() || {});
        renderData.assets = minicash.collections.assets.serialize();
        return renderData;
    },

    onRender: function() {
        this.initializeValidator();
    },

    initializeValidator: function() {
        this.validator = this.getUI('form').validate({
            rules: {
                saldo: {required: true},
            },
            messages: {
                saldo: tr("Please enter an initial saldo"),
            },
        });
    },

    onAssetChange: function(e) {
        this.renderAsset($(e.target).val());
    },

    renderAsset: function(assetId) {
        assetId = assetId || this.getUI('assetsSelect').val();
        let asset = minicash.collections.assets.get(assetId);
        console.log(asset);
    },

    onSaveBtnClick: function() {
        this.saveForm();
    },

    onCancelBtnClick: function() {
        this.model.destroy();
    },

    saveForm: function() {

    },

    lockControls: function() {
        return this.uiDisable(['saveBtn', 'cancelBtn']);
    },

    unlockControls: function() {
        return this.uiEnable(['saveBtn', 'cancelBtn']);
    },
}); // AssetsTabPanelView
