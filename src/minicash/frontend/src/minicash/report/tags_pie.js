'use strict';

/* global _,minicash,tr */

import Chart from 'chart.js';
import Decimal from 'decimal.js';
import Hb from 'handlebars/runtime';
import Mn from 'backbone.marionette';

import * as models from 'minicash/models';
import * as utils from 'minicash/utils';


export let TagsPieWidget = models.ReportWidget.extend({

});


export let TagsPieReportView = Mn.View.extend({
    MODE: {
        RECORDS_COUNT: 1,
        RECORDS_DELTA: 2,
    },

    MAX_GROUPS: 10,
    TAGS_TO_REPORT: 3,

    model: TagsPieWidget,

    tagName: 'canvas',

    template: _.noop,

    chart: null,

    collectionEvents: {
        sync: 'onDataReady'
    },

    onDestroy: function() {
        this._destroyChart();
    },

    onDataReady: function(collection, response, options) {
        if (this.isAttached()) {
            this.renderChart();
        } else {
            this.listenToOnceobject('before:attach', () => this.renderChart());
        }
    },

    renderChart: function() {
        this._destroyChart();
        let [data, labels] = this.compute();

        let chartData = {
            datasets: [{
                data: data,
                backgroundColor: utils.colors.makeColorsGradient(data.length),
            }],

            labels: labels
        };

        this.chart = new Chart(this.$el, {
            type: 'pie',
            data: chartData,
            options: {},
        });
    },

    _destroyChart: function() {
        if (this.chart) {
            this.chart.destroy();
        }
    },

    compute: function() {
        switch(this.options.mode) {
        case this.MODE.RECORDS_COUNT:
            return this._computeRecordsCountForTags();
        case this.MODE.RECORDS_DELTA:
            return this._computeRecordsDeltaForTags();
        default:
            return [0, tr('Error')];
        }
    },

    _computeRecordsCountForTags: function() {
        let tagsToRecordsCount = {};

        this.collection.forEach((record) => {
            for (let tag of record.get('tags')) {
                if (!tagsToRecordsCount.hasOwnProperty(tag)) {
                    tagsToRecordsCount[tag] = 0;
                }
                tagsToRecordsCount[tag] += 1;
            }
        });

        let recordsCountToTags = _.chain(tagsToRecordsCount)
            .map((val, key) => { return {tagName: key, count: val}; })
            .groupBy('count')
            .value();

        let topTagsCount = _.chain(recordsCountToTags)
            .keys()
            .sortBy().reverse()
            .takeRight(this.MAX_GROUPS)
            .value();

        let topTags = _.map(topTagsCount, (c) => {
            return _.chain(recordsCountToTags[c])
                .take(this.TAGS_TO_REPORT)
                .map('tagName')
                .join(', ')
                .value();
        });

        return [topTagsCount, topTags];
    },

    _computeRecordsDeltaForTags: function() {
        let RECORD_MODES = minicash.CONTEXT.RECORD_MODES;

        let tagsToSumDelta = {};

        this.collection.forEach((record) => {
            for (let tag of record.get('tags')) {
                if (!tagsToSumDelta.hasOwnProperty(tag)) {
                    tagsToSumDelta[tag] = Decimal(0);
                }

                let delta = Decimal(record.get('delta'));
                switch(record.get('mode')) {
                case RECORD_MODES.EXPENSE.value:
                    tagsToSumDelta[tag] = tagsToSumDelta[tag].plus(delta);
                }

            }
        });

        let deltaSumToTags = _.chain(tagsToSumDelta)
            .map((val, key) => { return {
                tagName: key,
                delta: val.toFixed(0)
            }; })
            .groupBy('delta')
            .value();

        let allTagsDelta = _.chain(deltaSumToTags)
            .keys().map(Number)
            .sortBy().reverse()
            .value();

        let topTagsDelta = _.take(allTagsDelta, this.MAX_GROUPS - 1);
        let restTagsDelta = _.chain(allTagsDelta).takeRight(_.size(deltaSumToTags) - _.size(topTagsDelta)).sum().value();
        topTagsDelta.push(restTagsDelta);

        let topTags = _.map(topTagsDelta, (d) => {
            return _.chain(deltaSumToTags[d])
                .take(this.TAGS_TO_REPORT)
                .map('tagName')
                .join(', ')
                .value();
        });

        topTags[topTags.length - 1] = tr('Others');


        return [topTagsDelta, topTags];
    },
});
