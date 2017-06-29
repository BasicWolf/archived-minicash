'use strict';

/* global _ */

import Mn from 'backbone.marionette';
import * as tabbar from './tabbar';
import {HomeTab} from './tabs/tab_home';


export let TabbarManager = Mn.Object.extend({
    initialize: function(options) {
        this.tabbarView = new tabbar.TabbarView();
        this.tabbarView.render();
        this.openTab(HomeTab);
    },

    openTab: function(tabtype, options) {
        options = _.extend({
            source: null,
            manager: this,
        }, options);

        let tabModel = new tabtype(options);
        this.tabbarView.add(tabModel, {show: true});
    },
});
