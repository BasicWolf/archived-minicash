'use strict';

/* global _,$,minicash,require */
import Hb from 'handlebars';
import Mn from 'backbone.marionette';
import * as bootbox from 'bootbox';
import * as models from 'minicash/models';

import {RecordsFilterView} from 'minicash/components/records_filter';
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
    template: require('templates/tab_report/tab_report.hbs'),

    collection: new models.PageableRecords([], {
        state: {
            pageSize: minicash.CONTEXT.settings.PAGINATOR_MAX_PAGE_SIZE,
            sortKey: '-created_ts',
        }
    }),

    regions: {
        tagsPieRegion1: {el: '[data-spec="tags-pie-region-1"]'},
        tagsPieRegion2: {el: '[data-spec="tags-pie-region-2"]'},
        recordsFilterRegion: {el: '[data-spec="records-filter-region"]'},
    },

    ui: {
        toggleFilterBtn: 'button[data-spec="toggle-filter"]',
    },

    events: {
        'click @ui.toggleFilterBtn': 'toggleFilter',
    },


    initialize: function() {
        this.collection.getPage(1);
    },

    onRender: function() {
        this.showChildView('recordsFilterRegion', new RecordsFilterView({collection: this.collection}));

        this.showChildView('tagsPieRegion1', new TagsPieReportView({
            mode: 1,
            collection: this.collection,
        }));

        this.showChildView('tagsPieRegion2', new TagsPieReportView({
            mode: 2,
            collection: this.collection,
        }));
    },

    toggleFilter: function() {
        this.getChildView('recordsFilterRegion').toggle();
    },

    onChildviewFilterChange: function(filterParams) {
        this.collection.search(filterParams);
    },


});
