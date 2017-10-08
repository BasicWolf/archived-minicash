'use strict';

/* global _,minicash,moment */

import * as base from './models_base';

export let ID_NOT_SAVED = -1;


export let Tag = base.MinicashModel.extend({
    idAttribute: 'pk',

    urlRoot: function() { return minicash.url('tags-list'); },

    serverAttributes: [
        'pk',
        'name',
        'records_count',
        'description',
    ],
});


export let Tags = base.MinicashCollection.extend({
    model: Tag,

    url: function() { return minicash.url('tags-list'); },

    massDeleteUrl: function() { return minicash.url('tags-mass-delete'); },

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


export let Asset = base.MinicashModel.extend({
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


export let Assets = base.MinicashCollection.extend({
    model: Asset,

    url: function() { return minicash.url('assets-list'); },

    comparator: 'name'
});


export let Record = base.MinicashModel.extend({
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


export let RecordsMixin = {
    model: Record,

    url: function() { return minicash.url('records-list'); },

    massDeleteUrl: function() { return minicash.url('records-mass-delete'); },
};

export let Records = base.MinicashCollection.extend(RecordsMixin);

export let PageableRecords = base.MinicashPageableCollection.extend(RecordsMixin);

export let ReportWidget = base.MinicashModel.extend({

});
