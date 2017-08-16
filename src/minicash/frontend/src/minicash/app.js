'use strict';
/* global _,console,window */

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
let assetsChannel = Radio.channel('assets');
let tagsChannel = Radio.channel('tags');


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

    /* Routes and Navigation */
    /* ===================== */
    navigate: function(fragment, options) {
        if (fragment == null || !_.isString(fragment)) {
            console.warning('fragment is invalid: ', fragment);
            fragment = '';
        }

        options = _.extend({trigger: true}, options);
        return Bb.history.navigate(fragment, options);
    },

    navigateTo: function(name, params, options) {
        let route = this.reverse(name, params);
        if (!route) {
            console.error('Unable to find router for ', name);
            return;
        } else {
            this.navigate(route, options);
        }
    },

    reverse: function(name, params) {
        for (let r in this.routers) {
            let router = this.routers[r];
            try {
                let route = router.reverse(name, params);
                return route;
            } catch (e) {
                // try next router
            }
        }

        return null;
    },

    /* App initialization and internals */
    /* ================================ */
    initialize: function() {
        this.CONTEXT = window.minicash.CONTEXT;
        this._initCollections();
        this._bootstrapData();
    },

    _initCollections: function() {
        this.collections = {
            assets: new models.Assets(),
            tags: new models.Tags(),
        };

        recordsChannel.on('model:save', (model) => {
            this.collections.assets.fetch();
            this.collections.tags.updateFromRecord(model);
        });

        assetsChannel.on('model:save', (model) => {
            this.collections.assets.add(model, {merge: true});
        });

        tagsChannel.on('model:save', (model) => {
            this.collections.tags.add(model, {merge: true});
        });
    },

    _bootstrapData: function() {
        this.collections.assets.reset(this.CONTEXT.bootstrap.assets);
        this.collections.tags.reset(this.CONTEXT.bootstrap.tags);
    },

    onStart: function() {
        this._startControllers();
        this._startNavigation();
        this.started = true;
    },


    _startControllers: function() {
        this.controllers = {
            tabs: new TabsController,
        };
    },

    _startNavigation: function() {
        this.routers = {
            tabs: new TabsRouter({controller: this.controllers.tabs}),
        };

        Bb.history.start({pushState: true});

        // ensure that HomeTab is always loaded as the first tab
        this.controllers.tabs.home({show: false});

        // this.routers.tabs.navigate(this.CONTEXT.route, {trigger: true});
    }
});
