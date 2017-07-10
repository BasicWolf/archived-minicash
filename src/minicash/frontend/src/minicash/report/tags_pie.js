/* global _ */

import Chart from 'chart.js';
import Hb from 'handlebars/runtime';
import Mn from 'backbone.marionette';

import * as models from 'minicash/models';



export let TagsPieReportView = Mn.View.extend({
    model: models.ReportWidget,

    tagName: 'canvas',

    template: _.noop,

    onBeforeAttach: function() {
        let data = {
            datasets: [{
                data: [10, 20, 30]
            }],

            // These labels appear in the legend and in the tooltips when hovering different arcs
            labels: [
                'Red',
                'Yellow',
                'Blue'
            ]
        };

        // For a pie chart
        let myPieChart = new Chart(this.$el, {
            type: 'pie',
            data: data,
            options: {},
        });
    },
});
