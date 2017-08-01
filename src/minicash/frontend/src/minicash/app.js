'use strict';
/* global _ */

// NOTE, these MUST be loaded before anything, because monkey-patching happens here
import './defaults';
import './extensions';

import {sprintf} from 'sprintf-js';
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';

import * as models from './models';
import * as utils from './utils';
import * as views from './views';

import {ReportTab} from './tabs/tab_report';
import {HomeTab} from './tabs/tab_home';
import {TabbarManager} from './components/tabbar_manager';


let recordsChannel = Radio.channel('records');


export default Mn.Application.extend({
    /* Public interface */
    /* ================ */
    status: utils.status,
    notify: utils.notifier,

    url: function(name, args={}) {
        let url = this.CONTEXT.urls[name].url;
        return sprintf(url, args);
    },

    static: function (url) {
        return this.CONTEXT.settings.STATIC_URL + url;
    },


    /* App initialization and internals */
    /* ================================ */
    initialize: function() {
        this.CONTEXT = window.minicash.CONTEXT;
        this._initCollections();
    },

    _initCollections: function() {
        this.collections = {
            assets: new models.Assets,
            tags: new models.Tags,
        };

        recordsChannel.on('model:save', (model) => {
            this.collections.assets.fetch();
            this.collections.tags.updateFromRecord(model);
        });
    },

    onStart: function() {
        this._bootstrapData();
        this.tabbar = new TabbarManager({firstTab: HomeTab});
    },

    _bootstrapData: function() {
        this.collections.assets.reset(this.CONTEXT.bootstrap.assets);
        this.collections.tags.reset(this.CONTEXT.bootstrap.tags);
    },

});
