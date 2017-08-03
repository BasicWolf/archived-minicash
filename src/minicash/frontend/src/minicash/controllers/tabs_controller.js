'use strict';

/* global _ */

import Mn from 'backbone.marionette';
import * as tabbar from 'minicash/components/tabbar';

import {HomeTab} from 'minicash/tabs/tab_home';

export let TabsController = Mn.Object.extend({
    initialize: function(options) {
        this.tabbarView = new tabbar.TabbarView();
        this.tabbarView.render();
    },

    openTab: function(tabName, options) {
        let tabtype = HomeTab;

        options = _.extend({
            source: null,
            manager: this,
        }, options);

        let tabModel = new tabtype(options);
        this.tabbarView.add(tabModel, {show: true});
    },
});
