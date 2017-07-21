'use strict';

/* global _,minicash */

import Chart from 'chart.js';
import Hb from 'handlebars/runtime';
import Mn from 'backbone.marionette';

import * as models from 'minicash/models';
import * as utils from 'minicash/utils';


export let TagsPieWidget = models.ReportWidget.extend({

});


export let TagsPieReportView = Mn.View.extend({
    model: TagsPieWidget,

    tagName: 'canvas',

    template: _.noop,

    collection: new models.PageableRecords([], {
        state: {
            pageSize: minicash.CONTEXT.settings.PAGINATOR_MAX_PAGE_SIZE,
        }
    }),

    collectionEvents: {
        sync: 'onDataReady'
    },

    initialize: function() {
        this.collection.getPage(1);
    },

    onDataReady: function(collection, response, options) {
        if (this.isAttached()) {
            this.renderChart();
        } else {
            this.listenToOnceobject('before:attach', () => this.renderChart());
        }
    },

    renderChart: function() {
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
            .map((val, key) => { return {name: key, count: val}; })
            .groupBy('count')
            .value();

        debugger;
        let topTagsCounts = _.chain(recordsCountToTags)
            .keys()
            .sortBy()
            .takeRight(10)
            .value();

        let topTags = _.map(topTagsCounts, (c) => {
            return _.chain(recordsCountToTags[c])
                .take(3)
                .map('name')
                .join(', ')
                .value();
        });

        let data = {
            datasets: [{
                data: topTagsCounts,
                backgroundColor: utils.colors.makeColorsGradient(topTagsCounts.length),
            }],


            labels: topTags
        };

        // For a pie chart
        let myPieChart = new Chart(this.$el, {
            type: 'pie',
            data: data,
            options: {},
        });
    }
});
