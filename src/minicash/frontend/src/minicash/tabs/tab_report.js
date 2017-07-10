'use strict';

/* global _,$,minicash,require */
import Hb from 'handlebars/runtime';
import Mn from 'backbone.marionette';
import * as bootbox from 'bootbox';


import {TabPanelView, TabModel} from 'components/tabbar';
import {TagsPieReportView} from 'report/tags_pie';

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
 });


let ReportTabPanelView = TabPanelView.extend({
    template: require('templates/tab_report/tab_report.hbs'),

    regions: {
        tagsPieRegion: {el: '[data-spec="tags_pie_region"]'},
    },

    onRender: function() {
        this.showChildView('tagsPieRegion', new TagsPieReportView({'a': 10}));
    }
});
