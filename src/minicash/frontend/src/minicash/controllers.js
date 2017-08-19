'use strict';

/* global _,minicash */

import Mn from 'backbone.marionette';
import * as tabbar from 'minicash/components/tabbar';

import * as utils from 'minicash/utils';
import {HomeTab} from 'minicash/tabs/tab_home';
import {AssetTab} from 'minicash/tabs/tab_asset';
import {AssetsTab} from 'minicash/tabs/tab_assets';
import {RecordTab} from 'minicash/tabs/tab_record';
import {RecordsTab} from 'minicash/tabs/tab_records';
import {ReportTab} from 'minicash/tabs/tab_report';
import {TagsTab} from 'minicash/tabs/tab_tags';
import {TagTab} from 'minicash/tabs/tab_tag';


let allTabsTypes = [
    HomeTab,
    AssetTab,
    AssetsTab,
    RecordTab,
    RecordsTab,
    ReportTab,
    TagsTab,
];

let tabAliasToType = _.transform(
    allTabsTypes,
    (result, tabType) => result[tabType.alias] = tabType,
    {}
);

export let TabsController = Mn.Object.extend({
    initialize: function(options) {
        this.tabbarView = new tabbar.TabbarView();
        this.tabbarView.render();
    },

    openTab: function(tabModel, options={}) {
        options = _.extend({show: true}, options);
        this.tabbarView.add(tabModel, options);
    },

    index: function(options={}) {
        this.openTab(new HomeTab({route: '/'}), options);
    },

    tab_record: function(recordId) {

    },

    tab_records: function(recordId) {
        if (recordId) {
            this.openTab(new RecordTab({recordId: recordId}));
        } else {
            this.openTab(new RecordsTab());
        }
    },

    tab_new_record: function(newRecordId) {
        if (!newRecordId) {
            newRecordId = utils.generateId();
        }

        let recordTab = new RecordTab({route: minicash.url('tab_new_record', {id: newRecordId})});
        this.openTab(recordTab);
    },

    tab_assets: function(assetId) {
        if (assetId) {
            this.openTab(new AssetTab({assetId: assetId}));
        } else {
            this.openTab(new AssetsTab());
        }
    },

    tab_new_asset: function(newAssetId) {
        if (!newAssetId) {
            newAssetId = utils.generateId();
        }
        let assetTab = new AssetTab({route: minicash.url('tab_new_asset', {id: newAssetId})});
        this.openTab(assetTab);
    },

    tab_tags: function(tagId) {
        if (tagId) {
            this.openTab(new TagTab({tagId: tagId}));
        } else {
            this.openTab(new TagsTab());
        }
    },

    tab_new_tag: function(newTagId) {
        if (!newTagId) {
            newTagId = utils.generateId();
        }
        let tagTab = new TagTab({route: minicash.url('tab_new_tag', {id: newTagId})});
        this.openTab(tagTab);
    },

    tab_report: function() {
        let reportTab = new ReportTab();
        this.openTab(reportTab);
    },

    getActiveTab: function() {
        return this.tabbarView.collection.getFirstChosen();
    }

});
