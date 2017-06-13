'use strict';

/* global $,_,moment,minicash,require,tr */

import {TabPanelView, TabModel} from 'tabbar';

export let HomeTabPanelView = TabPanelView.extend({
    validator: null,

    template: require('templates/tab_home.hbs'),

    ui: {
        allRecordsBtn: 'button[data-spec="all-records"]',
    },

    events: {
        'click @ui.allRecordsBtn': 'openAllRecords',
    },

    openAllRecords: function() {
        this.openTab(minicash.tabbarManager.TABS.RECORDS);
    },

}); // HomeTabPanelView



export let HomeTab = TabModel.extend({
    defaults: function() {
        return {
            title: 'Home',
            name: 'home',
            viewClass: HomeTabPanelView,
        };
    }
});
