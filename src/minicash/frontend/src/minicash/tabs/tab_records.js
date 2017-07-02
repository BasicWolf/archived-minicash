'use strict';

/* global _,$,minicash,require */
import Hb from 'handlebars/runtime';
import Mn from 'backbone.marionette';
import * as bootbox from 'bootbox';

import {PaginatorView} from 'components/paginator';
import {TabPanelView, TabModel} from 'tabbar';
import {RecordTab} from './tab_record';


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
        this.showChildView('recordsTableRegion', new RecordsTableView({collection: minicash.collections.records})) ;
        this.showChildView('paginatorRegion', new PaginatorView({collection: minicash.collections.records}));
    },

    startNewRecord: function() {
        minicash.tabbar.openTab(RecordTab);
    },

    deleteSelectedRecords: function() {
        let dfdDoDelete = $.Deferred();

        bootbox.confirm({
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

        dfdDoDelete.then(() => {
            let selectedRecords = this.getSelectedRecords();

            for (let model of selectedRecords) {
                model.destroy({wait: true});
            }
        });

    },

    onChildviewPageChange: function(pageNumber) {
        minicash.collections.records.getPage(pageNumber);
    },

    onSelectedRecordsChange: function(selectedRecords) {
        this.uiEnable('deleteRecordBtn', !!selectedRecords.length);
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
        let selectedRecordModels = _.pluck(selectedRecords, 'model');
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
        minicash.tabbar.openTab(RecordTab, {
            record: this.model
        });
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
