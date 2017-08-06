'use strict';

/* global _ */

import Mn from 'backbone.marionette';
import * as tabbar from 'minicash/components/tabbar';

import {HomeTab} from 'minicash/tabs/tab_home';
import {AssetTab} from 'minicash/tabs/tab_asset';

let allTabsTypes = [
    HomeTab,
    AssetTab,
];

let tabNamesToTypes = _.transform(
    allTabsTypes,
    (result, tabType) => result[tabType.tabName] = tabType,
    {}
);

export let TabsController = Mn.Object.extend({
    initialize: function(options) {
        this.tabbarView = new tabbar.TabbarView();
        this.tabbarView.render();
    },

    openTab: function(tabName, options) {
        let tabtype = tabNamesToTypes[tabName];

        options = _.extend({
            source: null,
            manager: this,
        }, options);

        let tabModel = new tabtype(options);
        this.tabbarView.add(tabModel, {show: true});
    },

    openHome: function() {
        this.openTab('home');
    },

    getCurrentTab: function() {
        return this.tabbarView.collection.getFirstChosen();
    }

});
