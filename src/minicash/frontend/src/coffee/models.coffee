import Bb from 'backbone'

export ID_NOT_SAVED = -1


export BaseModel = Bb.Model.extend
    save: (attrs, options) ->
        attrs = attrs || @toJSON()
        options = options || {}

        # if model defines serverAttributes, replace attrs with trimmed version
        if (@serverAttributes)
            attrs = _.pick(attrs, @serverAttributes)

        # Move attrs to options
        options.attrs = attrs
        Backbone.Model.prototype.save.call(@, attrs, options)


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


export SubRecords = Bb.Collection.extend
    model: SubRecord

    initialize: (models, options) ->
        # modelDefaults =
        #     'parent_record': id_of_parent_record
        @modelDefaults = options.modelDefaults
