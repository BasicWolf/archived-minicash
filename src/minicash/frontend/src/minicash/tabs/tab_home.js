'use strict';

/* global $,_,minicash,require,tr */

import {TabPanelView, TabModel} from 'components/tabbar';
import {RecordsTab} from './tab_records';
import {RecordTab} from './tab_record';
import {AssetsTab} from './tab_assets';



export let HomeTab = TabModel.extend({
    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            title: 'Home',
            name: 'home',
            singleInstance: true,
            permanent: true,
            viewClass: HomeTabPanelView,
        });
    }
});


export let HomeTabPanelView = TabPanelView.extend({
    validator: null,

    template: require('templates/tab_home.hbs'),

    ui: {
        allRecordsBtn: 'button[data-spec="all-records"]',
        newRecordBtn: 'button[data-spec="start-new-record"]',
        assetsBtn: 'button[data-spec="assets"]',
    },

    events: {
        'click @ui.allRecordsBtn': 'openAllRecords',
        'click @ui.newRecordBtn': 'startNewRecord',
        'click @ui.assetsBtn': 'openAssets',
    },

    openAllRecords: function() {
        minicash.tabbar.openTab(RecordsTab);
    },

    startNewRecord: function() {
        minicash.tabbar.openTab(RecordTab);
    },

    openAssets: function() {
        minicash.tabbar.openTab(AssetsTab);
    },

}); // HomeTabPanelView
