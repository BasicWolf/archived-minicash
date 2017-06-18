'use strict';

/* global minicash */

import * as utils from './utils';

export let ID_NOT_SAVED = -1;

export let Record = utils.BaseModel.extend({
    idAttribute: 'pk',

    urlRoot: function() {return  minicash.url('records-list'); },

    serverAttributes: [
        'pk',
        'asset_from',
        'asset_to',
        'dt_stamp',
        'delta',
        'description',
        'extra',
        'mode',
        'owner',
        'tags',
    ],
});


export let Records = utils.BasePageableCollection.extend({
    model: Record,

    url: function() { return minicash.url('records-list'); }
});


export let Asset = utils.BaseModel.extend({
    idAttribute: 'pk',

    urlRoot: function() { return minicash.url('assets-list'); },

    serverAttributes: [
        'pk',
        'name',
        'description',
        'owner',
        'saldo',
    ],
});


export let Assets = utils.BaseCollection.extend({
    model: Asset,

    url: function() { return minicash.url('assets-list'); }
});


export let Tag = utils.BaseModel.extend({
    idAttribute: 'pk',

    urlRoot: function() { return minicash.url('tag-list'); },

    serverAttributes: [
        'pk',
        'name',
        'description',
    ],
});

export let Tags = utils.BaseCollection.extend({
    model: Tag,

    url: function() { return minicash.url('tag-list'); },

    initialize: function() {
        this.bloodhound = new utils.Bloodhound(this, 'name');
    },
});
