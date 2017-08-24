'use strict';
/* global _,$,console,window */

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
        let urls = this.CONTEXT.urls[name];

        let query = '';
        // find query arguments which are transformed to
        // something like ?arg1=val1&arg2=val2...
        if (args._queryArgs != null) {
            query = $.param(args._queryArgs);
            delete args._queryArgs;
        }

        // find corresponding URL expression based on args
        let url = null;
        for (let urlObj of urls) {
            // if passed args' keys match url object args
            if (_.isEmpty(_.difference(_.keys(args), urlObj.args))) {
                url = urlObj.sprintf_url;
                break;
            }
        }

        let route = sprintf(url, args);
        if (query) {
            route += '?' + query;
        }
        return route;
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

    navigateTo: function(name, args={}, options={}) {
        let route = this.url(name, args);
        if (!route) {
            console.error('Unable to find router for ', name, args);
            return;
        } else {
            this.navigate(route, options);
        }
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
        this._startRouters();
        this._startNavigation();
        this.started = true;
    },


    _startControllers: function() {
        this.controllers = {
            tabs: new TabsController(),
        };
    },

    _startRouters: function() {
        // All routes which start with '/tab'
        let tabRoutes = {};
        for (let name in this.CONTEXT.urls) {
            if (!_.startsWith(name, 'tab')) {
                continue;
            }
            let urlObjects = this.CONTEXT.urls[name];

            for (let urlObject of urlObjects) {
                tabRoutes[urlObject.bb_route] = name;
            }
        }

        tabRoutes = _.extend({'': 'index'}, tabRoutes);
        tabRoutes = _.extend({'/': 'index'}, tabRoutes);

        this.routers = {
            tabs: new Mn.AppRouter({
                appRoutes:  tabRoutes,
                controller: this.controllers.tabs,
            })
        };

    },

    _startNavigation: function() {
        Bb.history.start({pushState: true});

        // ensure that HomeTab is always loaded as the first tab
        this.controllers.tabs.index({show: false});
    }
});
