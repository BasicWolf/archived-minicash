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
    initialize(options) {
        this.tabbarView = new tabbar.TabbarView();
        this.tabbarView.render();
    },

    openTab(tabModel, options={}) {
        options = _.extend({show: true}, options);
        this.tabbarView.add(tabModel, options);
    },

    index(options={}) {
        this.openTab(new HomeTab({route: '/'}), options);
    },

    tab_record(recordId) {
        this.openTab(new RecordTab({recordId: recordId}));
    },

    tab_records_group(recordsIdsStr='') {
        let recordsIds = recordsIdsStr.split(',');
        this.openTab(new RecordTab({recordsIds: recordsIds}));
    },

    tab_records(query) {
        this.openTab(new RecordsTab());
    },

    tab_new_record(newRecordId) {
        if (!newRecordId) {
            newRecordId = utils.generateId();
        }

        let recordTab = new RecordTab({route: minicash.url('tab_new_record', {id: newRecordId})});
        this.openTab(recordTab);
    },

    tab_assets(assetId) {
        if (assetId) {
            this.openTab(new AssetTab({assetId: assetId}));
        } else {
            this.openTab(new AssetsTab());
        }
    },

    tab_new_asset(newAssetId) {
        if (!newAssetId) {
            newAssetId = utils.generateId();
        }
        let assetTab = new AssetTab({route: minicash.url('tab_new_asset', {id: newAssetId})});
        this.openTab(assetTab);
    },

    tab_tags(tagId) {
        if (tagId) {
            this.openTab(new TagTab({tagId: tagId}));
        } else {
            this.openTab(new TagsTab());
        }
    },

    tab_new_tag(newTagId) {
        if (!newTagId) {
            newTagId = utils.generateId();
        }
        let tagTab = new TagTab({route: minicash.url('tab_new_tag', {id: newTagId})});
        this.openTab(tagTab);
    },

    tab_report() {
        let reportTab = new ReportTab();
        this.openTab(reportTab);
    },

    getActiveTab() {
        return this.tabbarView.collection.getFirstChosen();
    }

});
