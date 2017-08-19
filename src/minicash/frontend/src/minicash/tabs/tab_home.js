'use strict';

/* global $,_,minicash,require,tr */

import Bb from 'backbone';
import {TabPanelView, TabModel} from 'components/tabbar';


export let HomeTab = TabModel.extend({
    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            title: 'Home',
            singleInstance: true,
            permanent: true,
            order: 0,
            viewClass: HomeTabPanelView,
        });
    }
});


let openTab = (tab) => minicash.tabbar.openTab(tab);

export let HomeTabPanelView = TabPanelView.extend({
    validator: null,

    template: require('templates/tab_home.hbs'),

    ui: {
        allRecordsBtn: 'button[data-spec="all-records"]',
        newRecordBtn: 'button[data-spec="start-new-record"]',
        assetsBtn: 'button[data-spec="assets"]',
        reportsBtn: 'button[data-spec="reports"]',
        tagsBtn: 'button[data-spec="tags"]',
    },

    events: {
        'click @ui.allRecordsBtn': () => minicash.navigateTo('tab_records'),
        'click @ui.newRecordBtn': () => minicash.navigateTo('tab_new_record'),
        'click @ui.assetsBtn': () => minicash.navigateTo('tab_assets'),
        'click @ui.reportsBtn': () => minicash.navigateTo('tab_report'),
        'click @ui.tagsBtn': () => minicash.navigateTo('tab_tags')
    },
}); // HomeTabPanelView
