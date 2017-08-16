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

    home: function(options={}) {
        this.openTab(new HomeTab({route: '/'}), options);
    },

    records: function(recordId) {
        if (recordId) {
            this.openTab(new RecordTab({recordId: recordId}));
        } else {
            this.openTab(new RecordsTab());
        }
    },

    new_record: function(newRecordId) {
        if (!newRecordId) {
            newRecordId = utils.generateId();
        }
        let recordTab = new RecordTab({route: minicash.reverse('new_record', {id: newRecordId})});
        this.openTab(recordTab);
    },

    assets: function(assetId) {
        if (assetId) {
            this.openTab(new AssetTab({assetId: assetId}));
        } else {
            this.openTab(new AssetsTab());
        }
    },

    getActiveTab: function() {
        return this.tabbarView.collection.getFirstChosen();
    }

});
