'use strict';

/* global _,$,minicash,require */

import * as bootbox from 'bootbox';
import Hb from 'handlebars/runtime';
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';

import * as models from 'minicash/models';
import * as views from 'minicash/views';
import {PaginatorView} from 'minicash/components/paginator';
import {RecordsFilterView} from 'minicash/components/records_filter';
import {TabPanelView, TabModel} from 'minicash/components/tabbar';
import {tr} from 'minicash/utils';
import {RecordTab} from './tab_record';

let recordsChannel = Radio.channel('records');


export let RecordsTab = TabModel.extend({
    defaults() {
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

    initialize() {
        recordsChannel.on('model:save', (model) => {
            this.collection.add(model, {at: 0, merge: true});
        });

        this.onQueryArgsChange();
    },

    onRender() {
        //this.showChildView('recordsTableRegion', new FlatRecordsTableView({collection: this.collection}));
        this.showChildView('recordsTableRegion', new GroupedRecordsTableView(this.collection));
        this.showChildView('topPaginatorRegion', new PaginatorView({collection: this.collection}));
        this.showChildView('bottomPaginatorRegion', new PaginatorView({collection: this.collection}));
        this.showChildView('recordsFilterRegion', new RecordsFilterView({collection: this.collection}));
    },

    onQueryArgsChange: function(model, queryArgs=null) {
        queryArgs = queryArgs || this.model.get('queryArgs');
        let page = parseInt(queryArgs.page) || 1;
        this.collection.getPage(page);
    },

    startNewRecord() {
        minicash.navigateTo('tab_new_record');
    },

    deleteSelectedRecords() {
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

    toggleFilter() {
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

    getSelectedRecords() {
        let recordsTableView = this.getChildView('recordsTableRegion');
        return recordsTableView.getSelectedRecords();
    },

    onCollectionStateChange: function(newState={}) {

    },
});


let FlatRecordsTableView = views.MinicashView.extend({
    tagName: 'table',
    className: 'table table-striped',
    template: require('templates/tab_records/flat_records_table.hbs'),

    attributes: {
        'cellspacing': '0',
        'data-spec': 'records-table',
    },

    regions: {
        body: {
            el: 'tbody',
            replaceElement: true
        }
    },

    childViewTriggers: {
        'selected:records:change': 'selected:records:change',
    },

    onRender() {
        this.showChildView('body', new FlatRecordsTbody({
            collection: this.collection
        }));
    },
});


let FlatRecordsTbody = Mn.NextCollectionView.extend({
    tagName: 'tbody',
    childView: () => RecordRowView,

    onChildviewRecordSelectedChange: function(childView, e) {
        this.triggerMethod('selected:records:change', this.getSelectedRecords());
    },

    getSelectedRecords() {
        let selectedRecords = this.children.filter((c) => c.isSelected());
        let selectedRecordModels = _.map(selectedRecords, 'model');
        return selectedRecordModels;
    },
});


let RecordRowView = Mn.View.extend({
    tagName: 'tr',
    template: require('templates/tab_records/flat_record_tr.hbs'),

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

    isSelected() {
        return this.getUI('recordChk').is(':checked');
    },

    editRecord() {
        minicash.navigateTo('tab_record', {id: this.model.id});
    },
});


/* ---- Grouped records views ---- */
/* =============================== */

let GroupedRecordsTableView = Mn.NextCollectionView.extend({
    tagName: 'table',
    className: 'table table-striped',
    childView: () => GroupedRecordsView,

    attributes: {
        "cellspacing": "0",
    },

    initialize(recordsCollection) {
        this.collection = new models.PageableGroupedRecords(recordsCollection);
    },

    onRender() {
        let theadTemplate = require('templates/tab_records/grouped_records_table_thead.hbs');
        let $tableHead = $(theadTemplate());
        this.$el.prepend($tableHead);
    },
});


let GroupedRecordsView = Mn.View.extend({
    tagName: 'tbody',
    template: require('templates/tab_records/grouped_records_table_tr.hbs'),

    ui: {
        activeRowArea: 'td[role="button"]',
        recordChk: 'input[data-spec="select-record"]',
    },

    regions: {
        groupedRecordsHeaderRowRegion: {
            el: '[data-spec="grouped-records-header-row-region"]',
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

    onRender() {
        this.showChildView('groupedRecordsHeaderRowRegion', new RecordsGroupHeaderView({model: this.model}));
    }
});


let RecordsGroupHeaderView = views.MinicashView.extend({
    tagName: 'tr',
    template: require('templates/tab_records/records_group_header.hbs')

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


let RecordsGroupRecordsTableView = views.MinicashView.extend({
    tagName: 'tr',
    template: require('templates/tab_records/records_group_table.hbs'),

    attributes: {
        'cellspacing': '0',
    },

    regions: {
        body: {
            el: 'tbody',
            replaceElement: true
        }
    },

    onRender() {
        this.showChildView('body', new GroupedRecordsTbody({
            collection: this.model.get('records')
        }));
    },
});


let GroupedRecordsTbody = Mn.NextCollectionView.extend({
    tagName: 'tbody',
    childView: () => GroupedRecordRowView,

    onChildviewRecordSelectedChange: function(childView, e) {
        this.triggerMethod('selected:records:change', this.getSelectedRecords());
    },

    getSelectedRecords() {
        let selectedRecords = this.children.filter((c) => c.isSelected());
        let selectedRecordModels = _.map(selectedRecords, 'model');
        return selectedRecordModels;
    },
});


let GroupedRecordRowView = views.MinicashView.extend({
    tagName: 'tr',
    template: require('templates/tab_records/records_group_record_tr.hbs'),
});



Hb.registerHelper('record_account', (assetFrom, assetTo, options) => {
    assetFrom = minicash.collections.assets.get(assetFrom);
    assetTo = minicash.collections.assets.get(assetTo);

    let EMPTY = '';

    let assetFromName = assetFrom ? assetFrom.get('name') : EMPTY;
    let assetToName = assetTo ? assetTo.get('name') : EMPTY;

    return `${assetFromName} ➡ ${assetToName}`.trim();
});
