'use strict';

/* global _,minicash,moment */

import Decimal from 'decimal.js';

import * as base from './models_base';


export let ID_NOT_SAVED = -1;


export let UserProfile = base.MinicashModel.extend({

});


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

export let Records = base.MinicashCollection.extend({});
_.extend(Records.prototype, RecordsMixin);

export let PageableRecords = base.MinicashPageableCollection.extend(RecordsMixin);


export let RecordsGroup = base.MinicashModel.extend({
    // attributes:
    // key
    // records
    // asset_from
    // asset_to
    // individualTags
    // mode
    // sharedTags
    // total_delta

    initialize() {
        this.on('change:records',  this.onRecordsChange);
        this.onRecordsChange(this, this.get('records'));
    },

    onRecordsChange(model, records, options) {
        if (records.length === 0) {
            throw ['Invalid grouped records collection', records];
        }

        let firstRecord = records.at(0);
        this.set('created_dt', firstRecord.get('created_dt'));

        let totalDelta =  records.reduce((memo, rec) => {
            return memo.add(rec.get('delta'));
        }, new Decimal(0));

        this.set('total_delta', totalDelta);

        this.set('asset_from', firstRecord.get('asset_from'));
        this.set('asset_to', firstRecord.get('asset_to'));
        this.set('mode', firstRecord.get('mode'));

        /* Tags: shared and individual */
        let recordTags = records.reduce((result, record) => {
            let tags = record.get('tags');
            _.each(tags, (tag) => {
                if (result[tag] == null) {
                    result[tag] = 0;
                }
                result[tag] += 1;
            });
            return result;
        }, {});

        let sharedTags = _.chain(recordTags)
            .pickBy((val, key) => val > 1)
            .keys()
            .value();

        let individualTags = _.chain(recordTags)
            .pickBy((val, key) => val == 1)
            .keys()
            .value();

        this.set('shared_tags', sharedTags);
        this.set('individual_tags', individualTags);

        /* Description */
        let joinedDescription = records.chain()
            .filter((rec) => rec.get('description'))
            .map((rec) => rec.get('description'))
            .join('; ')
            .value();

        this.set('description', joinedDescription);
    }
});


export let PageableGroupedRecords = base.MinicashPageableCollection.extend({
    model: RecordsGroup,

    constructor(recordsCollection, options) {
        this.recordsCollection = recordsCollection;
        this.listenTo(this.recordsCollection, 'update', this.onRecordsUpdate);
        base.MinicashPageableCollection.prototype.constructor.call(this, null, options);
        this.onRecordsUpdate();
    },

    onRecordsUpdate(recordsCollection, options) {
        recordsCollection = recordsCollection || this.recordsCollection;
        this.state = recordsCollection.state;

        let gropedRecords = recordsCollection.groupBy((rec) => {
            let key = rec.chain().pick('asset_from', 'asset_to', 'created_dt', 'mode').values().join('_').value();
            return key;
        });
        let modelsData = _.map(gropedRecords, (value, key) => {
            return {key: key, records: new Records(value)};
        });
        this.set(modelsData);
    }
});


export let ReportWidget = base.MinicashModel.extend({

});
