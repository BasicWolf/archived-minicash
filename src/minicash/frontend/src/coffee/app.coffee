import 'bootstrap/dist/css/bootstrap.css';
import 'eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css';

import {sprintf} from 'sprintf-js'

import './extensions'
import './defaults'

import Mn from 'backbone.marionette'
import {TabbarManager} from './tabbar_manager'
import {Assets, Records} from './models'
import {url} from './utils'



export default Mn.Application.extend
    initialize: ->
        @CONTEXT = window._minicashContext
        @initCollections()

    initCollections: ->
        @collections =
            assets: new Assets
            records: new Records

    onStart: ->
        @bootstrapData()
        @tabbarManager = new TabbarManager

        @tabbarManager.render()
        @tabbarManager.openTab('records')


    bootstrapData: ->
        @collections.assets.reset(@CONTEXT.bootstrap.assets)
        @collections.records.fetch()

    url: (name, args) ->
        args ?= {}
        u = minicash.CONTEXT.urls[name].url
        return sprintf(u, args)
