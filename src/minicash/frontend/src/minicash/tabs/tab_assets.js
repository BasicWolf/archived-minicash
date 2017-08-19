'use strict';

/* global _,$,minicash,require */
import Hb from 'handlebars/runtime';
import Mn from 'backbone.marionette';
import * as bootbox from 'bootbox';

import {tr} from 'minicash/utils';
import {TabPanelView, TabModel} from 'minicash/components/tabbar';
import {AssetTab} from './tab_asset';


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
}, {
    alias: 'assets'
});


let AssetsTabPanelView = TabPanelView.extend({
    template: require('templates/tab_assets/tab_assets.hbs'),

    ui: {
        newAssetBtn: 'button[data-spec="start-new-asset"]',
        deleteAssetBtn: 'button[data-spec="delete-asset"]',
    },

    regions: {
        assetsTableRegion: {el: '[data-spec="assets-table-region"]'},
    },

    events: {
        'click @ui.newAssetBtn': 'startNewAsset',
        'click @ui.deleteAssetBtn': 'deleteSelectedAssets',
    },

    childViewEvents: {
        'selected:assets:change': 'onSelectedAssetsChange',
    },

    onRender: function() {
        this.showChildView('assetsTableRegion', new AssetsTableView({collection: minicash.collections.assets})) ;
    },

    startNewAsset: function() {
        minicash.navigateTo('tab_new_asset');
    },

    deleteSelectedAssets: function() {
        let dfdDoDelete = $.Deferred();

        bootbox.confirm({
            message: tr('Are you sure you want to delete the selected assets?'),
            buttons: {
                confirm: {
                    label: tr('Yes'),
                    className: 'btn-danger'
                },
                cancel: {
                    label: ('No'),
                }
            },
            callback: function (result) {
                if (result) {
                    dfdDoDelete.resolve();
                }
            }
        });

        dfdDoDelete.then(() => {
            let selectedAssets = this.getSelectedAssets();

            for (let model of selectedAssets) {
                model.destroy({wait: true});
            }
        });

    },

    onChildviewPageChange: function(pageNumber) {
        minicash.collections.assets.getPage(pageNumber);
    },

    onSelectedAssetsChange: function(selectedAssets) {
        this.uiEnable('deleteAssetBtn', !!selectedAssets.length);
    },

    getSelectedAssets: function() {
        let assetsTableView = this.getChildView('assetsTableRegion');
        return assetsTableView.getSelectedAssets();
    },
});


let AssetsTableView = Mn.NextCollectionView.extend({
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
        let selectedAssetModels = _.map(selectedAssets, 'model');
        return selectedAssetModels;
    },
});


let AssetRowView = Mn.View.extend({
    tagName: 'tbody',
    template: require('templates/tab_assets/asset_row.hbs'),

    ui: {
        activeRowArea: 'td[role="button"]',
        chkAsset: 'input[data-spec="select-asset"]',
    },

    events: {
        'click @ui.activeRowArea': 'editAsset',
    },

    modelEvents: {
        'change': 'render',
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
    },

    editAsset: function() {
        minicash.navigateTo('tab_assets', {id: this.model.id});
    },
});
