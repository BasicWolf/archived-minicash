'use strict';

/* global $,_,minicash,require,tr */

import {TabPanelView, TabModel} from 'components/tabbar';
import {RecordsTab} from './tab_records';
import {RecordTab} from './tab_record';
import {AssetsTab} from './tab_assets';
import {ReportTab} from './tab_report';
import {TagsTab} from './tab_tags';


export let HomeTab = TabModel.extend({
    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            title: 'Home',
            name: HomeTab.alias,
            singleInstance: true,
            permanent: true,
            viewClass: HomeTabPanelView,
        });
    }
}, {
    alias: 'home'
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
        'click @ui.allRecordsBtn': () => openTab(RecordsTab),
        'click @ui.newRecordBtn': () => openTab(RecordTab),
        'click @ui.assetsBtn': () => openTab(AssetsTab),
        'click @ui.reportsBtn': () => openTab(ReportTab),
        'click @ui.tagsBtn': () => openTab(TagsTab),
    },
}); // HomeTabPanelView
