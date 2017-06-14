'use strict';

/* global _ */

import Mn from 'backbone.marionette';
import * as tabbar from './tabbar';
import {HomeTab} from './tabs/tab_home';
import {RecordsTab} from './tabs/tab_records';
import {RecordTab} from './tabs/tab_record';
import {AssetsTab} from './tabs/tab_asset';


export let TabbarManager = Mn.Object.extend({
    TABS: {},

    initialize: function(options) {
        _.extend(this.TABS, {
            HOME: HomeTab,
            NEW_RECORD: RecordTab,
            RECORDS: RecordsTab,
            ASSETS: AssetsTab,
        });

        console.debug('Initializing TabbarManager');
        this.tabbarView = new tabbar.TabView();
        console.debug('TabbarManager initialized');
    },

    openTab: function(tabtype, options) {
        options = _.extend({
            source: null
        }, options);

        let tabModel = new tabtype(options);
        this.tabbarView.add(tabModel, {show: true});
    },

    render: function() {
        this.tabbarView.render();
    }
});
