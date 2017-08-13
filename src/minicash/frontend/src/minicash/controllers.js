'use strict';

/* global _ */

import Mn from 'backbone.marionette';
import * as tabbar from 'minicash/components/tabbar';

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

    openTab: function(tabAlias, itemId=undefined, tabOptions={}, options={}) {
        options = _.extend({show: true}, options);

        let tabtype = tabAliasToType[tabAlias];
        let tabModel = new tabtype(tabOptions);
        tabModel.fetchData(itemId).then(() => this.tabbarView.add(tabModel, options));
    },

    openHome: function() {
        this.openTab('home');
    },

    getActiveTab: function() {
        return this.tabbarView.collection.getFirstChosen();
    }

});
