'use strict';

/* global _,Backbone,require, */

import Bb from 'backbone';
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
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
            title: 'New tab',
            permanent: false,        // false - allow closing the tab
            singleInstance: true,    // true - only one instance of this tab in tabbar
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
        this.getUI('a').tab('show');
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
});
_.extend(TabPanelView.prototype, views.UIEnableDisableMixin);


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
        options = _.extend({'show': false}, options);

        let showTabModel = tabModel;
        let shouldAdd = true;

        if (tabModel.get('singleInstance')) {
            let existingTabModel = this.collection.find(
                (tm) => tm.get('name') === tabModel.get('name')
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
