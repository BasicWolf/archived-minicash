'use strict';

/* global _ */

import Mn from 'backbone.marionette';
import * as tabbar from './tabbar';


export let TabbarManager = Mn.Object.extend({
    initialize: function(options) {
        this.tabbarView = new tabbar.TabbarView();
        this.tabbarView.render();
        this.openTab(options.firstTab);
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
