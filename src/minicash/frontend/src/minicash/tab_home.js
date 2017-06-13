'use strict';

/* global $,_,moment,minicash,require,tr */

import {TabPanelView, TabModel} from 'tabbar';


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
    },

    events: {
        'click @ui.allRecordsBtn': 'openAllRecords',
        'click @ui.newRecordBtn': 'startNewRecord',
    },

    openAllRecords: function() {
        this.openTab(minicash.tabbarManager.TABS.RECORDS);
    },

    startNewRecord: function() {
        this.openTab(minicash.tabbarManager.TABS.NEW_RECORD);
    }
}); // HomeTabPanelView
