'use strict';

/* global _,minicash,moment */

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

    updateFromRecord: function(record) {
        /* Update collection from zipped (record.tags, record.tags_names)
            for each tag not present.
         */

        if (record.get('tags_names') == null) {
            return;
        }

        let shouldFetch = false;

        // Here a partial update to collection is happening: tags are added wit ID and NAME.
        // However a full fetch is required to get the actual tags state.
        for (let [tagId, tagName] of _.zip(record.get('tags'), record.get('tags_names'))) {
            if (this.get(tagId) == null) {
                this.add(new Tag({pk: tagId, name: tagName}));
                shouldFetch = true;
            }
        }

        if (shouldFetch) {
            this.fetch();
        }
    },
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
