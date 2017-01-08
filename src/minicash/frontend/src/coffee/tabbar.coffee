import Bb from 'backbone'
import Mn from 'backbone.marionette'
import './lib/backbone-chooser'

import * as utils from './utils'

# import as not working for hbs, using require()
navTemplate = require('../templates/tabbar/nav.hbs')


export TabModel = Bb.Model.extend
    initialize: ->
        new Backbone.Chooser(@)

    defaults: ->
        name: utils.generateId()
        source: null
        title: 'New tab'
        viewClass: null


TabCollection = Bb.Collection.extend
    initialize: ->
        new Backbone.SingleChooser(@)


TabNavView = Mn.View.extend
    tagName: 'li'

    attributes:
        'role': 'presentation'

    template: navTemplate

    ui:
        'a': 'a'

    modelEvents:
        'model:chosen': 'onTabChosen'

    onRender: ->
        @getUI('a').on('shown.bs.tab', =>
            @triggerMethod('tab:shown', @model))

    onAttach: ->
        @getUI('a').tab()

    onTabChosen: ->
        @getUI('a').tab('show')


TabsNavsView = Mn.CollectionView.extend
    childView: TabNavView
    tagName: 'ul'
    className: 'nav nav-tabs'
    attributes:
        role: "tablist"


export TabPanelView = Mn.View.extend
    tagName: 'div'
    className: 'tab-pane'
    attributes:
        'role': 'tabpanel'

    constructor: (options)  ->
        Mn.View.prototype.constructor.apply(this, arguments)
        name = options.model.get('name')
        @$el.attr('id', "tab_#{ name }")
        return @


TabsPanelView = Mn.CollectionView.extend
    className: 'tab-content'

    childView: (item) ->
        viewClass = item.get('viewClass')
        viewClass? and viewClass or TabPanelView


export TabView = Mn.View.extend
    el: '#tabview_container'
    template: false
    collection: new TabCollection

    collectionEvents:
        'destroy': 'onModelDestroyed'

    regions:
        navRegion: {el: '#tabview_nav_region', replaceElement: true}
        panelRegion: {el: '#tabview_panel_region', replaceElement: true}

    onRender: ->
        # NOTE: order is important here, panels should receive collection events
        # before navigation tabs.
        @showChildView('panelRegion', new TabsPanelView(collection: @collection))
        @showChildView('navRegion', new TabsNavsView(collection: @collection))

    add: (tabModel, options) ->
        options = _.extend('show': false, options)

        @collection.add(tabModel)
        if options.show
            @collection.choose(tabModel)

    onModelDestroyed: (model, collection, options) ->
        if model.get('source')
            @collection.choose(model.get('source'))

    onChildviewTabShown: (model) ->
        @collection.choose(model)

