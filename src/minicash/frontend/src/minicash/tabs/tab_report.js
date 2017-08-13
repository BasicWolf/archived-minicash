'use strict';

/* global _,$,minicash,require */
import Hb from 'handlebars/runtime';
import Mn from 'backbone.marionette';
import * as bootbox from 'bootbox';
import * as models from 'minicash/models';

import {RecordsFilter} from 'minicash/components/records_filter';
import {TabPanelView, TabModel} from 'minicash/components/tabbar';
import {TagsPieReportView} from 'minicash/report/tags_pie';


export let ReportTab = TabModel.extend({
    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            title: 'Report',
            name: 'report',
            singleInstance: true,
            viewClass: ReportTabPanelView,
        });
    },
}, {
    alias: 'report'
});


let ReportTabPanelView = TabPanelView.extend({
    behaviors: [RecordsFilter, ],

    template: require('templates/tab_report/tab_report.hbs'),

    regions: {
        tagsPieRegion1: {el: '[data-spec="tags-pie-region-1"]'},
        tagsPieRegion2: {el: '[data-spec="tags-pie-region-2"]'},
    },

    collection: new models.PageableRecords([], {
        state: {
            pageSize: minicash.CONTEXT.settings.PAGINATOR_MAX_PAGE_SIZE,
            sortKey: '-created_ts',
        }
    }),

    initialize: function() {
        this.collection.getPage(1);
    },

    onRender: function() {
        this.showChildView('tagsPieRegion1', new TagsPieReportView({
            mode: 1,
            collection: this.collection,
        }));

        this.showChildView('tagsPieRegion2', new TagsPieReportView({
            mode: 2,
            collection: this.collection,
        }));
    },

    onFilterChange: function(filterParams) {
        this.collection.search(filterParams);
    },

});
