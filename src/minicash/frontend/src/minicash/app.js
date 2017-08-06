'use strict';
/* global _ */

// NOTE, these MUST be loaded before anything, because monkey-patching happens here
import './defaults';
import './extensions';

import {sprintf} from 'sprintf-js';
import Bb from 'backbone';
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';

import * as models from './models';
import * as utils from './utils';
import * as views from './views';
import {ReportTab} from './tabs/tab_report';
import {TabsRouter} from './routers';
import {TabsController} from './controllers';

let recordsChannel = Radio.channel('records');


export default Mn.Application.extend({
    /* Public interface */
    /* ================ */
    started: false,         // indicates whether application has started
    status: utils.status,   // shortcut to status
    notify: utils.notifier, // shortcut to notifications
    controllers: null,      // placeholder for controllers
    collections: null,      // placeholder for assets and tags collections
    CONTEXT: null,          // placeholder for server context

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
        this._initControllers();
        this._initRouters();
        this._bootstrapData();
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

    _initControllers: function() {
        this.controllers = {
            tabs: new TabsController,
        };
    },

    _initRouters: function() {
        this._routers = {
            tabs: new TabsRouter({controller: this.controllers.tabs}),
        };
        Bb.history.start({pushState: true});
    },

    _bootstrapData: function() {
        this.collections.assets.reset(this.CONTEXT.bootstrap.assets);
        this.collections.tags.reset(this.CONTEXT.bootstrap.tags);
    },

    onStart: function() {
        let initialRoute = this.CONTEXT.route || 'home';
        this._routers.tabs.navigate(initialRoute, {trigger: true});
        this.started = true;
    },
});
