import Mn from 'backbone.marionette'
import * as tabbar from './tabbar'
import {RecordsTab} from './tab_records'
import {RecordTab} from './tab_record'


export TabbarManager = Mn.Object.extend
    _tabBuilders:
        'newRecord': RecordTab
        'records': RecordsTab

    initialize: (options) ->
        console.debug('TabbarManager initialized')
        @tabbarView = new tabbar.TabView()

    openTab: (tabtype, options) ->
        options = _.extend({
            source: null
        }, options)

        tabBuilder = @_tabBuilders[tabtype]

        if tabBuilder?
            tabModel = new tabBuilder(options)
            @tabbarView.add(tabModel, show: true)

        else
            console.error('Invalid tabType: ' + tabtype)

    render: ->
        @tabbarView.render()
