'use strict';

/* global _,$,minicash,require */
import Hb from 'handlebars/runtime';
import Mn from 'backbone.marionette';

import {PaginatorView} from 'components/paginator';
import {TabPanelView, TabModel} from 'tabbar';


export let RecordsTab = TabModel.extend({
    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            title: 'Records',
            name: 'records',
            singleInstance: true,
            viewClass: RecordsTabPanelView,
        });
    },
});


let RecordsTabPanelView = TabPanelView.extend({
    template: require('templates/tab_records/tab_records.hbs'),

    ui: {
        newRecordBtn: 'button[data-spec="start-new-record"]',
        editRecordBtn: 'button[data-spec="edit-record"]',
        deleteRecordBtn: 'button[data-spec="delete-record"]',
    },

    regions: {
        recordsTableRegion: {el: '[data-spec="records-table-region"]'},
        paginatorRegion: {el: '[data-spec="paginator-region"]'},
    },

    events: {
        'click @ui.newRecordBtn': 'startNewRecord',
        'click @ui.editRecordBtn': 'editRecord'
    },

    childViewEvents: {
        'selected:records:change': 'onSelectedRecordsChange',
    },

    onRender: function() {
        this.showChildView('recordsTableRegion', new RecordsTableView({collection: minicash.collections.records})) ;
        this.showChildView('paginatorRegion', new PaginatorView({collection: minicash.collections.records}));
    },

    startNewRecord: function() {
        this.openTab(minicash.tabbarManager.TABS.NEW_RECORD);
    },

    editRecord: function() {
        let recordsTableView = this.getChildView('recordsTableRegion');
        let selectedRecords = recordsTableView.getSelectedRecords();

        if (selectedRecords.length === 1) {
            let selectedRecord = selectedRecords[0];

             this.openTab(minicash.tabbarManager.TABS.NEW_RECORD, {
                record: selectedRecord
            });
        }
    },

    onChildviewPageChange: function(pageNumber) {
        minicash.collections.records.getPage(pageNumber);
    },

    onSelectedRecordsChange: function(selectedRecords) {
        this.uiEnable('editRecordBtn', selectedRecords.length === 1);
        this.uiEnable('deleteRecordBtn', !!selectedRecords.length);
    }
});


let RecordsTableView = Mn.CollectionView.extend({
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
        let selectedRecords = [];
        this.children.each((c) => {
            if (c.isSelected()) {
                selectedRecords.push(c.model);
            }
        });
        return selectedRecords;
    },
});


let RecordRowView = Mn.View.extend({
    tagName: 'tbody',
    template: require('templates/tab_records/record_row.hbs'),

    ui: {
        chkRecord: 'input[data-spec="select-record"]',
    },

    modelEvents: {
        'sync': 'render',
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
    }
});



Hb.registerHelper('record_account', (assetFrom, assetTo, options) => {
    assetFrom = minicash.collections.assets.get(assetFrom);
    assetTo = minicash.collections.assets.get(assetTo);

    let EMPTY = '';

    let assetFromName = assetFrom ? assetFrom.get('name') : EMPTY;
    let assetToName = assetTo ? assetTo.get('name') : EMPTY;

    return `${assetFromName} ➡ ${assetToName}`.trim();
});
