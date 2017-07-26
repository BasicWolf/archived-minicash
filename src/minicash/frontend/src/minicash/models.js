'use strict';

/* global minicash,moment */

import * as utils from './utils';

export let ID_NOT_SAVED = -1;


export let Tag = utils.BaseModel.extend({
    idAttribute: 'pk',

    urlRoot: function() { return minicash.url('tags-list'); },

    serverAttributes: [
        'pk',
        'name',
        'records_count',
        'description',
    ],
});


export let Tags = utils.BaseCollection.extend({
    model: Tag,

    url: function() { return minicash.url('tags-list'); },

    comparator: 'name',
});


export let Asset = utils.BaseModel.extend({
    idAttribute: 'pk',

    urlRoot: function() { return minicash.url('assets-list'); },

    serverAttributes: [
        'pk',
        'name',
        'description',
        'owner',
        'balance',
    ],
});


export let Assets = utils.BaseCollection.extend({
    model: Asset,

    url: function() { return minicash.url('assets-list'); },

    comparator: 'name'
});


export let Record = utils.BaseModel.extend({
    idAttribute: 'pk',

    urlRoot: function() {return  minicash.url('records-list'); },

    serverAttributes: [
        'pk',
        'asset_from',
        'asset_to',
        'created_dt',
        'delta',
        'description',
        'extra',
        'mode',
        'owner',
        'tags',
        'tags_names',
    ],

    tagsNames: function() {
        let allTags = minicash.collections.tags;
        return _.map(this.get('tags'), (tagId) => allTags.get(tagId).get('name'));
    }
});


export let RecordsBase = {
    model: Record,

    url: function() { return minicash.url('records-list'); },
};

export let PageableRecords = utils.BasePageableCollection.extend(RecordsBase);


export let ReportWidget = utils.BaseModel.extend({

});
