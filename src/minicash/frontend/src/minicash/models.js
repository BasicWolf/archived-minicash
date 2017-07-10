'use strict';

/* global minicash,moment */

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


export let RecordsBase = {
    model: Record,

    url: function() { return minicash.url('records-list'); },

    comparator: function(itemA, itemB) {
        let m1 = moment(itemA.get('dt_stamp'), minicash.CONTEXT.user.dtFormat);
        let m2 = moment(itemB.get('dt_stamp'), minicash.CONTEXT.user.dtFormat);
        return -utils.compareMoments(m1, m2);
    }
};

export let PageableRecords = utils.BasePageableCollection.extend(RecordsBase);
//_.extend(PageableRecords.prototype, RecordsBase);


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

    comparator: 'name'
});

export let ReportWidget = utils.BaseModel.extend({

});
