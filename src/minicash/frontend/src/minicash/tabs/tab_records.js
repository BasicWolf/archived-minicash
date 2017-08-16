'use strict';

/* global _,$,minicash,require */

import * as bootbox from 'bootbox';
import Hb from 'handlebars/runtime';
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';

import * as models from 'minicash/models';
import {PaginatorView} from 'minicash/components/paginator';
import {RecordsFilter} from 'minicash/components/records_filter';
import {TabPanelView, TabModel} from 'minicash/components/tabbar';
import {tr} from 'minicash/utils';
import {RecordTab} from './tab_record';

let recordsChannel = Radio.channel('records');


export let RecordsTab = TabModel.extend({
    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            title: 'Records',
            singleInstance: true,
            viewClass: RecordsTabPanelView,
        });
    },
});


let RecordsTabPanelView = TabPanelView.extend({
    behaviors: [RecordsFilter, ],

    template: require('templates/tab_records/tab_records.hbs'),

    collection: new models.PageableRecords([], {
        state: {
            sortKey: '-created_ts',
        }
    }),

    initialize: function() {
        recordsChannel.on('model:save', (model) => {
            this.collection.add(model, {at: 0, merge: true});
        });

        this.collection.getPage(1);
    },

    ui: {
        newRecordBtn: 'button[data-spec="start-new-record"]',
        deleteRecordBtn: 'button[data-spec="delete-record"]',
    },

    regions: {
        recordsTableRegion: {el: '[data-spec="records-table-region"]'},
        paginatorRegion: {el: '[data-spec="paginator-region"]'},
    },

    events: {
        'click @ui.newRecordBtn': 'startNewRecord',
        'click @ui.deleteRecordBtn': 'deleteSelectedRecords',
    },

    childViewEvents: {
        'selected:records:change': 'onSelectedRecordsChange',
    },

    onRender: function() {
        this.showChildView('recordsTableRegion', new RecordsTableView({collection: this.collection})) ;
        this.showChildView('paginatorRegion', new PaginatorView({collection: this.collection}));
    },

    startNewRecord: function() {
        minicash.navigateTo('new_record');
    },

    deleteSelectedRecords: function() {
        let dfdDoDelete = $.Deferred();

        let box = bootbox.confirm({
            message: tr('Are you sure you want to delete the selected records?'),
            buttons: {
                confirm: {
                    label: tr('Yes'),
                    className: 'btn-danger'
                },
                cancel: {
                    label: ('No'),
                }
            },
            callback: function (result) {
                if (result) {
                    dfdDoDelete.resolve();
                }
            }
        });

        dfdDoDelete.done(() => {
            let selectedRecords = this.getSelectedRecords();
            this.collection.delete(selectedRecords);
        });

    },

    onChildviewPageChange: function(pageNumber) {
        this.collection.getPage(pageNumber);
    },

    onSelectedRecordsChange: function(selectedRecords) {
        this.uiEnable('deleteRecordBtn', !!selectedRecords.length);
    },

    onFilterChange: function(filterParams) {
        this.collection.search(filterParams);
    },

    getSelectedRecords: function() {
        let recordsTableView = this.getChildView('recordsTableRegion');
        return recordsTableView.getSelectedRecords();
    }
});


let RecordsTableView = Mn.NextCollectionView.extend({
    tagName: 'table',
    className: 'table table-striped',

    attributes: {
        "data-spec": "records-table",
        "cellspacing": "0",
        "width": "100%",
    },

    childView: () => RecordRowView,

    onRender: function() {
        let template = require('templates/tab_records/records_table_head.hbs');
        let $tableHead = $(template());
        this.$el.prepend($tableHead);
    },

    onChildviewRecordSelectedChange: function(childView, e) {
        this.triggerMethod('selected:records:change', this.getSelectedRecords());
    },


    getSelectedRecords: function() {
        let selectedRecords = this.children.filter((c) => c.isSelected());
        let selectedRecordModels = _.map(selectedRecords, 'model');
        return selectedRecordModels;
    },
});


let RecordRowView = Mn.View.extend({
    tagName: 'tbody',
    template: require('templates/tab_records/record_row.hbs'),

    ui: {
        activeRowArea: 'td[role="button"]',
        chkRecord: 'input[data-spec="select-record"]',
    },

    events: {
        'click @ui.activeRowArea': 'editRecord',
    },

    modelEvents: {
        'change': 'render',
    },

    triggers: {
        'change @ui.chkRecord': 'record:selected:change',
    },

    regions: {
        recordDataRegion: {
            el: '[data-spec="record-data-region"]',
            replaceElement: true,
        }
    },

    isSelected: function() {
        return this.getUI('chkRecord').is(':checked');
    },

    editRecord: function() {
        minicash.navigateTo('records', {id: this.model.id});
    },
});



Hb.registerHelper('record_account', (assetFrom, assetTo, options) => {
    assetFrom = minicash.collections.assets.get(assetFrom);
    assetTo = minicash.collections.assets.get(assetTo);

    let EMPTY = '';

    let assetFromName = assetFrom ? assetFrom.get('name') : EMPTY;
    let assetToName = assetTo ? assetTo.get('name') : EMPTY;

    return `${assetFromName} ➡ ${assetToName}`.trim();
});
