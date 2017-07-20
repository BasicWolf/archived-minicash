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

    initialize: function() {
        this._initializeTags();
    },

    _initializeTags: function() {
        let tags = minicash.collections.tags.clone();
        let tagsGroups = tags.groupBy((tag) => tag.get('records_count'));

        let sortedKeys = _.chain(tagsGroups).keys().sortBy();
        let sortedTags = [];

        for (let key of sortedKeys) {
            let names = _.map(tagsGroups[key], (tag) => tag.get('name'));

            sortedTags.push({
                'records_count': key,
                'names': names.join(', ')
            });
        }

        this.tags = _.take(sortedTags, 10);
    },

    onBeforeAttach: function() {
        let data = {
            datasets: [{
                data: this.tags.map((tag) => tag['records_count']),
                backgroundColor: utils.colors.makeColorsGradient(10),
            }],

            // These labels appear in the legend and in the tooltips when hovering different arcs
            labels: this.tags.map((tag) => tag['names'])
        };

        // For a pie chart
        let myPieChart = new Chart(this.$el, {
            type: 'pie',
            data: data,
            options: {},
        });
    },
});
