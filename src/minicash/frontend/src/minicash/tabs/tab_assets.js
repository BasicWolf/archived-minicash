'use strict';

/* global _,$,minicash,require */
import Hb from 'handlebars/runtime';
import Mn from 'backbone.marionette';

import {TabPanelView, TabModel} from 'tabbar';


export let AssetsTab = TabModel.extend({
    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            title: 'Assets',
            name: 'assets',
            singleInstance: true,
            viewClass: AssetsTabPanelView,
        });
    },
});


let AssetsTabPanelView = TabPanelView.extend({
    template: require('templates/tab_assets/tab_assets.hbs'),

    ui: {
        newAssetBtn: 'button[data-spec="start-new-asset"]',
        editAssetBtn: 'button[data-spec="edit-asset"]',
        deleteAssetBtn: 'button[data-spec="delete-asset"]',
    },

    regions: {
        assetsTableRegion: {el: '[data-spec="assets-table-region"]'},
    },

    events: {
        'click @ui.newAssetBtn': 'startNewAsset',
        'click @ui.editAssetBtn': 'editAsset'
    },

    childViewEvents: {
        'selected:assets:change': 'onSelectedAssetsChange',
    },

    onRender: function() {
        this.showChildView('assetsTableRegion', new AssetsTableView({collection: minicash.collections.assets})) ;
    },

    startNewAsset: function() {
        this.openTab(minicash.tabbarManager.TABS.EDIT_ASSET, {adding: true});
    },

    editAsset: function() {
        let assetsTableView = this.getChildView('assetsTableRegion');
        let selectedAssets = assetsTableView.getSelectedAssets();

        if (selectedAssets.length === 1) {
            let selectedAsset = selectedAssets[0];

             this.openTab(minicash.tabbarManager.TABS.EDIT_ASSET, {
                asset: selectedAsset
            });
        }
    },

    onChildviewPageChange: function(pageNumber) {
        minicash.collections.assets.getPage(pageNumber);
    },

    onSelectedAssetsChange: function(selectedAssets) {
        this.uiEnable('editAssetBtn', selectedAssets.length === 1);
        this.uiEnable('deleteAssetBtn', !!selectedAssets.length);
    }
});


let AssetsTableView = Mn.CollectionView.extend({
    tagName: 'table',
    className: 'table table-striped',

    attributes: {
        "data-spec": "assets-table",
        "cellspacing": "0",
        "width": "100%",
    },

    childView: () => AssetRowView,

    onRender: function() {
        let template = require('templates/tab_assets/assets_table_head.hbs');
        let $tableHead = $(template());
        this.$el.prepend($tableHead);
    },

    onChildviewAssetSelectedChange: function(childView, e) {
        this.triggerMethod('selected:assets:change', this.getSelectedAssets());
    },

    getSelectedAssets: function() {
        let selectedAssets = this.children.filter((c) => c.isSelected());
        let selectedAssetModels = _.pluck(selectedAssets, 'model');
        return selectedAssetModels;
    },
});


let AssetRowView = Mn.View.extend({
    tagName: 'tbody',
    template: require('templates/tab_assets/asset_row.hbs'),

    ui: {
        chkAsset: 'input[data-spec="select-asset"]',
    },

    modelEvents: {
        'sync': 'render',
    },

    triggers: {
        'change @ui.chkAsset': 'asset:selected:change',
    },

    regions: {
        assetDataRegion: {
            el: '[data-spec="asset-data-region"]',
            replaceElement: true,
        }
    },

    isSelected: function() {
        return this.getUI('chkAsset').is(':checked');
    }
});
