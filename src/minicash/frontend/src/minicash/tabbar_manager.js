'use strict';

/* global _ */

import Mn from 'backbone.marionette';
import * as tabbar from './tabbar';
import {HomeTab} from './tab_home';
import {RecordsTab} from './tab_records';
import {RecordTab} from './tab_record';

export let TabbarManager = Mn.Object.extend({
    TABS: {},

    initialize: function(options) {
        _.extend(this.TABS, {
            HOME: HomeTab,
            NEW_RECORD: RecordTab,
            RECORDS: RecordsTab,
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
