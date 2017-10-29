'use strict';

/* global _,$,minicash,require */

import * as bootbox from 'bootbox';
import Hb from 'handlebars/runtime';
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';

import * as models from 'minicash/models';
import {PaginatorView} from 'minicash/components/paginator';
import {RecordsFilterView} from 'minicash/components/records_filter';
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
    template: require('templates/tab_records/tab_records.hbs'),

    collection: new models.PageableRecords([], {
        state: {
            sortKey: '-created_ts',
        }
    }),

    collectionEvents: {
        'pageable:state:change': 'onCollectionStateChange',
    },

    modelEvents: {
        'change:queryArgs': 'onQueryArgsChange',
    },

    ui: {
        newRecordBtn: 'button[data-spec="start-new-record"]',
        deleteRecordBtn: 'button[data-spec="delete-record"]',
        toggleFilterBtn: 'button[data-spec="toggle-filter"]',
    },

    regions: {
        recordsTableRegion: {el: '[data-spec="records-table-region"]'},
        topPaginatorRegion: {el: '[data-spec="top-paginator-region"]'},
        bottomPaginatorRegion: {el: '[data-spec="bottom-paginator-region"]'},
        recordsFilterRegion: {el: '[data-spec="records-filter-region"]'},
    },

    events: {
        'click @ui.newRecordBtn': 'startNewRecord',
        'click @ui.deleteRecordBtn': 'deleteSelectedRecords',
        'click @ui.toggleFilterBtn': 'toggleFilter',
    },

    childViewEvents: {
        'selected:records:change': 'onSelectedRecordsChange',
    },

    initialize: function() {
        recordsChannel.on('model:save', (model) => {
            this.collection.add(model, {at: 0, merge: true});
        });

        this.onQueryArgsChange();
    },

    onRender: function() {
        let _debug_m = new models.GroupedRecordsCollection(this.collection);

        this.showChildView('recordsTableRegion', new RecordsTableView({collection: this.collection}));
        this.showChildView('topPaginatorRegion', new PaginatorView({collection: this.collection}));
        this.showChildView('bottomPaginatorRegion', new PaginatorView({collection: this.collection}));
        this.showChildView('recordsFilterRegion', new RecordsFilterView({collection: this.collection}));
    },

    onQueryArgsChange: function(model, queryArgs=null) {
        queryArgs = queryArgs || this.model.get('queryArgs');
        let page = parseInt(queryArgs.page) || 1;
        this.collection.getPage(page);
    },

    startNewRecord: function() {
        minicash.navigateTo('tab_new_record');
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

    toggleFilter: function() {
        this.getChildView('recordsFilterRegion').toggle();
    },

    onChildviewPageChange: function(pageNumber) {
        let queryArgs = {
            page: pageNumber
        };

        minicash.navigateTo('tab_records', {}, queryArgs);
    },

    onSelectedRecordsChange: function(selectedRecords) {
        this.uiEnable('deleteRecordBtn', !!selectedRecords.length);
    },

    onChildviewFilterChange: function(queryArgs) {
        this.collection.queryArgs = queryArgs;
        this.collection.getPage(1);
    },

    getSelectedRecords: function() {
        let recordsTableView = this.getChildView('recordsTableRegion');
        return recordsTableView.getSelectedRecords();
    },

    onCollectionStateChange: function(newState={}) {

    },
});


let RecordRowView = Mn.View.extend({
    tagName: 'tbody',
    template: require('templates/tab_records/record_tr.hbs'),

    ui: {
        activeRowArea: 'td[role="button"]',
        recordChk: 'input[data-spec="select-record"]',
    },

    events: {
        'click @ui.activeRowArea': 'editRecord',
    },

    modelEvents: {
        'change': 'render',
    },

    triggers: {
        'change @ui.recordChk': 'record:selected:change',
    },

    isSelected: function() {
        return this.getUI('recordChk').is(':checked');
    },

    editRecord: function() {
        minicash.navigateTo('tab_record', {id: this.model.id});
    },

    onRender() {

    },
});


let RecordsTableView = Mn.NextCollectionView.extend({
    tagName: 'table',
    className: 'table table-striped',

    attributes: {
        "cellspacing": "0",
    },

    childView: () => RecordRowView,

    onRender: function() {
        let theadTemplate = require('templates/tab_records/records_thead.hbs');
        let $tableHead = $(theadTemplate());
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


/* ---- Grouped records views ---- */
/* =============================== */


let GroupedRecordUnifiedRowView = Mn.View.extend({
    tagName: 'tr',
    template: require('templates/tab_records/grouped_records_unified_row.hbs')

    // ui:
    //     toggleSubRecordsBtn: 'button[data-spec="toggle-sub-records"]'

    // events:
    //     'click @ui.toggleSubRecordsBtn': 'toggleSubRecord'

    // toggleSubRecord: ->
    //     toggleSubRecordsBtnIcon = @getUI('toggleSubRecordsBtn').children('span')

    //     @_subRecordsOpen = not @_subRecordsOpen
    //     toggleSubRecordsBtnIcon.toggleClass('glyphicon-plus', not @_subRecordsOpen)
    //     toggleSubRecordsBtnIcon.toggleClass('glyphicon-minus', @_subRecordsOpen)

    //     @triggerMethod('toggleSubRecord', @_subRecordsOpen)
});


let GroupedRecordsRowView = Mn.View.extend({
    tagName: 'tbody',
    template: require('templates/tab_records/grouped_records_row.hbs'),

    ui: {
        activeRowArea: 'td[role="button"]',
        recordChk: 'input[data-spec="select-record"]',
    },

    regions: {
        groupedRecordsUnifiedRowRegion: {
            el: '[data-spec="grouped-records-unified-row-region"]',
            replaceElement: true,
        },

        groupedRecordsRegion: {
            el: '[data-spec="grouped-records-region"]',
            replaceElement: true,
        }
    },

    events: {
        'click @ui.activeRowArea': 'editRecord',
    },

    modelEvents: {
        'change': 'render',
    },


    onRender: function() {
        this.showChildView('groupedRecordsUnifiedRowRegion', new GroupedRecordUnifiedRowView({model: this.model}));
    }

});


let GroupedRecordsTableView = Mn.NextCollectionView.extend({
    tagName: 'table',
    className: 'table table-striped',

    initialize() {

    },

    attributes: {
        "cellspacing": "0",
    },

    childView: () => GroupedRecordsRowView,

    onRender() {
        let theadTemplate = require('templates/tab_records/grouped_records_thead.hbs');
        let $tableHead = $(theadTemplate());
        this.$el.prepend($tableHead);
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
