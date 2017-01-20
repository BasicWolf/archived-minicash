# NOTE, these MUST be loaded before anything, because monkey-patching happens here
import './defaults'
import './extensions'

import {sprintf} from 'sprintf-js'
import Mn from 'backbone.marionette'

import {TabbarManager} from './tabbar_manager'
import * as models from './models'
import * as utils from './utils'


export default Mn.Application.extend
    status: null
    notify: null

    initialize: ->
        @CONTEXT = window._minicashContext
        @initCollections()

    initCollections: ->
        @collections =
            assets: new models.Assets
            records: new models.Records
            tags: new models.Tags

    onStart: ->
        @status = new utils.Status
        @notify = new utils.Notify

        @bootstrapData()
        @tabbarManager = new TabbarManager

        @tabbarManager.render()
        @tabbarManager.openTab('records')


    bootstrapData: ->
        @collections.assets.reset(@CONTEXT.bootstrap.assets)
        @collections.tags.reset(@CONTEXT.bootstrap.tags)
        @collections.records.fetch()

    url: (name, args) ->
        args ?= {}
        u = minicash.CONTEXT.urls[name].url
        return sprintf(u, args)

    static: (url) ->
        return minicash.CONTEXT.settings.STATIC_URL + url
