import Bb from 'backbone'
import Decimal from 'jsdecimal'
import * as utils from './utils'

export ID_NOT_SAVED = -1


export BaseModel = Bb.Model.extend
    serverAttributes: null
    preprocessors: null
    toJSONRenderers: null

    save: (attrs, options) ->
        attrs = attrs || @toJSON()
        options = options || {}

        # if model defines serverAttributes, replace attrs with trimmed version
        if @serverAttributes?
            attrs = _.pick(attrs, @serverAttributes)

        # Move attrs to options
        options.attrs = attrs
        Backbone.Model.prototype.save.call(@, attrs, options)

    set: (key, val, options) ->
        _super = Backbone.Model.prototype.set
        if not @preprocessors?
            return _super.apply(this, arguments)

        # copied from original Backbone Model::set() source
        if typeof key == 'object'
            attrs = key;
            options = val;
        else
            (attrs = {})[key] = val

        for attr, pfunc of @preprocessors
            if _.has(attrs, attr)
                attrs[attr] = pfunc(attrs[attr])
        return _super.call(this, attrs, options)

    toJSON: (options) ->
        _super = Backbone.Model.prototype.toJSON

        if not @toJSONRenderers?
            return _super.apply(this, arguments)

        data = _super.call(@, options)
        for attr, pfunc of @toJSONRenderers
            if _.has(data, attr)
                data[attr] = pfunc(data[attr])
        return data


export SubRecord = BaseModel.extend
    idAttribute: 'pk'
    urlRoot: -> minicash.url('sub_records-list')

    serverAttributes: [
        'pk',
        'delta',
        'description',
        'owner',
        'parent_record',
        'tags',
    ]

    preprocessors: {
        'delta': Decimal
    }

    toJSONRenderers: {
        'delta': utils.decimalToString
    }


export SubRecords = Bb.Collection.extend
    model: SubRecord

    initialize: (models, options) ->
        # modelDefaults =
        #     'parent_record': id_of_parent_record
        @modelDefaults = options.modelDefaults


export Record = BaseModel.extend
    idAttribute: 'pk'
    urlRoot: -> minicash.url('records-list')

    serverAttributes: [
        'pk',
        'asset_from',
        'asset_to',
        'created_date',
        'delta',
        'description',
        'extra',
        'owner',
        'tags',
    ]

    preprocessors: {
        'delta': Decimal
    }

    toJSONRenderers: {
        'delta': utils.decimalToString
    }


export Records = Bb.Collection.extend
    model: Record
    url: -> minicash.url('records-list')


export Asset = BaseModel.extend
    idAttribute: 'pk'
    urlRoot: -> minicash.url('asset-list')

    serverAttributes: [
        'pk',
        'name',
        'description',
        'owner',
        'saldo',
    ]


export Assets = Bb.Collection.extend
    model: Asset


export Tag = BaseModel.extend
    idAttribute: 'pk'
    urlRoot: -> minicash.url('tag-list')

    serverAttributes: [
        'pk',
        'name',
        'description',
    ]


export Tags = Bb.Collection.extend
    model: Tag
    url: -> minicash.url('tag-list')

    initialize: ->
        @bloodhound = new utils.Bloodhound(@, 'name')

