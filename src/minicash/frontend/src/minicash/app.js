'use strict';

// NOTE, these MUST be loaded before anything, because monkey-patching happens here
import './defaults';
import './extensions';

import {sprintf} from 'sprintf-js';
import Mn from 'backbone.marionette';

import {TabbarManager} from './tabbar_manager';
import * as models from './models';
import * as utils from './utils';


export default Mn.Application.extend({
    status: utils.status,
    notify: utils.notifier,

    initialize: function() {
        this.CONTEXT = window._minicashContext;
        this.initCollections();
    },

    initCollections: function() {
        this.collections = {
            assets: new models.Assets,
            records: new models.Records,
            tags: new models.Tags,
        };
    },

    onStart: function() {
        this.bootstrapData();
        this.tabbarManager = new TabbarManager;

        this.tabbarManager.render();
        this.tabbarManager.openTab(this.tabbarManager.TABS.HOME);
    },

    bootstrapData: function() {
        this.collections.assets.reset(this.CONTEXT.bootstrap.assets);
        this.collections.tags.reset(this.CONTEXT.bootstrap.tags);
        this.collections.records.fetch();
    },

    url: function(name, args={}) {
        let url = this.CONTEXT.urls[name].url;
        return sprintf(url, args);
    },

    static: function (url) {
        return this.CONTEXT.settings.STATIC_URL + url;
    }
});
