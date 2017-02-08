'use strict';

/* global _,Backbone,minicash,require, */

import Bb from 'backbone';
import Mn from 'backbone.marionette';
import 'backbone.choosy';

import * as utils from 'utils';
import * as views from 'views';

export let TabModel = Bb.Model.extend({
    initialize: function() {
        return new Backbone.Choosy(this);
    },

    defaults: function() {
        return {
            name: utils.generateId(),
            source: null,
            title: 'New tab',
            viewClass: null,
        };
    }
});


let TabCollection = Bb.Collection.extend({
    initialize: function() {
        return new Backbone.SingleChooser(this);
    }
});


let TabNavView = Mn.View.extend({
    tagName: 'li',

    attributes: {
        'role': 'presentation'
    },

    template: require('templates/tabbar/nav.hbs'),

    ui: {
        'a': 'a',
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
        this.getUI('a').tab('show');
    },
});


let TabsNavsView = Mn.CollectionView.extend({
    childView: TabNavView,
    tagName: 'ul',
    className: 'nav nav-tabs',
    attributes: {
        role: "tablist",
    },
});


export let TabPanelView = Mn.View.extend({
    tagName: 'div',
    className: 'tab-pane',
    attributes: {
        'role': 'tabpanel',
    },

    constructor: function(options) {
        Mn.View.prototype.constructor.apply(this, arguments);
        let name = options.model.get('name');
        this.$el.attr('id', `tab_${name}`);
        return this;
    },

    openTab: function(tabType, options) {
        options = _.extend({
            source: this.model
        }, options);
        minicash.tabbarManager.openTab(tabType, options);
    },
});
_.extend(TabPanelView.prototype, views.UIEnableDisableMixin);


let TabsPanelView = Mn.CollectionView.extend({
    className: 'tab-content',

    childView: function(item) {
        let viewClass = item.get('viewClass');
        return viewClass != null ? viewClass : TabPanelView;
    },
});


export let TabView = Mn.View.extend({
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
        options = _.extend({'show': false}, options);

        this.collection.add(tabModel);
        if (options.show) {
            this.collection.choose(tabModel);
        }
    },

    onModelDestroyed: function(model, collection, options) {
        if (model.get('source')) {
            this.collection.choose(model.get('source'));
        }
    },

    onChildviewTabShown: function(model) {
        this.collection.choose(model);
    },
});
