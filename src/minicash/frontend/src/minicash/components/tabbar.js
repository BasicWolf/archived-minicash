'use strict';

/* global _,$,Backbone,minicash,require, */

import Bb from 'backbone';
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import 'backbone.choosy';

import * as views from 'minicash/views';


export let TabModel = Bb.Model.extend({
    initialize: function() {
        this.onRouteChange();
        this.listenTo(this, 'route:change', this.onRouteChange);
        return new Backbone.Choosy(this);
    },

    defaults: function() {
        let route = Bb.history.getFragment();
        return {
            route: route,
            routeId: this._getRouteId(route), // a HTML `id` attribute-friendly formatted route

            title: 'New tab',
            permanent: false,        // false - allow closing the tab
            singleInstance: true,    // true - only one instance of this tab in tabbar
            order: undefined,
            viewClass: null,
        };
    },

    onRouteChange: function() {
        let routeId = this._getRouteId(this.get('route'));
        this.set('routeId', routeId);
    },

    _getRouteId: function(route) {
        let routeId = _.replace(route, this.constructor._routeIdRegex, '_');
        return routeId;
    },
}, {
    _routeIdRegex: new RegExp('[\/?=]', 'g')
});


let TabCollection = Bb.Collection.extend({
    initialize: function() {
        return new Backbone.SingleChooser(this);
    },

    comparator: 'order'
});


let TabNavView = Mn.View.extend({
    tagName: 'li',

    attributes: {
        'role': 'presentation'
    },

    template: require('templates/tabbar/nav.hbs'),

    ui: {
        a: 'a',
        closeTabButton: 'button[data-spec="close-tab"]',
    },

    events: {
        'click @ui.closeTabButton': 'onCloseTabButtonClick',
    },

    modelEvents: {
        'model:chosen': 'onTabChosen',
    },

    onRender: function() {
        let self = this;
        this.getUI('a').on('shown.bs.tab', function() {
            self.triggerMethod('tab:shown', self.model);
        });
    },

    onAttach: function() {
        this.getUI('a').tab();
    },

    onTabChosen: function() {
        let $a = this.getUI('a');
        $a.tab('show');
        minicash.navigate($a.attr('href'), {trigger: false});
    },

    onCloseTabButtonClick: function() {
        this.model.destroy();
    },
});


let TabsNavsView = Mn.NextCollectionView.extend({
    childView: TabNavView,
    tagName: 'ul',
    className: 'nav nav-tabs',
    attributes: {
        role: "tablist",
    },
});


export let TabPanelView = views.BaseView.extend({
    tagName: 'div',
    className: 'tab-pane',
    attributes: {
        'role': 'tabpanel',
    },

    constructor: function(options) {
        Mn.View.prototype.constructor.apply(this, arguments);
        let routeId = options.model.get('routeId');
        this.$el.attr('id', `tab_${routeId}`);
        return this;
    },
});


let TabsPanelView = Mn.NextCollectionView.extend({
    className: 'tab-content',

    childView: function(item) {
        let viewClass = item.get('viewClass');
        return viewClass != null ? viewClass : TabPanelView;
    },
});


export let TabbarView = Mn.View.extend({
    el: '#tabview_container',
    template: false,
    collection: new TabCollection(),

    collectionEvents: {
        'destroy': 'onModelDestroyed',
    },

    regions: {
        navRegion: {el: '#tabview_nav_region', replaceElement: true},
        panelRegion: {el: '#tabview_panel_region', replaceElement: true},
    },

    onRender: function() {
        // NOTE: order is important here, panels should receive collection events
        // before navigation tabs.
        this.showChildView('panelRegion', new TabsPanelView({collection: this.collection}));
        this.showChildView('navRegion', new TabsNavsView({collection: this.collection}));
    },

    add: function(tabModel, options) {
        let showTabModel = tabModel;
        let shouldAdd = true;

        if (tabModel.get('singleInstance')) {
            let existingTabModel = this.collection.find(
                (tm) => tm.get('route') === tabModel.get('route')
            );

            if (existingTabModel) {
                showTabModel = existingTabModel;
                shouldAdd = false;
            }
        }

        if (shouldAdd) {
            this.collection.add(tabModel);
        }

        if (options.show) {
            this.collection.choose(showTabModel);
        }
    },

    onModelDestroyed: function(model, collection, options) {
        this.collection.choose(this.collection.at(-1));
    },

    onChildviewChildviewTabShown: function(model) {
        this.collection.choose(model, {silent: true});
    },
});
