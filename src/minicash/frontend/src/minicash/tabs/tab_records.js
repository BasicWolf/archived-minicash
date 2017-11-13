'use strict';

/* global _,$,minicash,require */

import * as bootbox from 'bootbox';
import Hb from 'handlebars';
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
        // this.showChildView('recordsTableRegion', new FlatRecordsTableView({collection: this.collection}));
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
        'data-spec': 'flat-records-table',
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
        'data-spec': 'grouped_records_table',
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
    template: Hb.compile(`
        <tr data-spec="grouped-records-header-row-region"></tr>

        <tr data-spec="grouped-records-row-wrapper" class="hidden">
          <td data-spec="grouped-records-region" colspan="7"></td>
        </tr>
    `),

    ui: {
        activeRowArea: 'td[role="button"]',
        recordChk: 'input[data-spec="select-record"]',
        groupRecordsRowWrapper: 'tr[data-spec="grouped-records-row-wrapper"]',
    },

    regions: {
        groupedRecordsHeaderRowRegion: {
            el: 'tr[data-spec="grouped-records-header-row-region"]',
            replaceElement: true,
        },

        groupedRecordsRecordsRowRegion: {
            el: 'td[data-spec="grouped-records-region"]',
            replaceElement: false,
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
        if (this.model.get('records').length > 1) {
            this.showChildView('groupedRecordsRecordsRowRegion', new RecordsGroupRecordsTableView({model: this.model}));
        }
    },

    onChildviewToggleRecordsGroup(show) {
        let region = this.getRegion('groupedRecordsRecordsRowRegion');

        if (show && this.model.get('records').length > 1) {
            region.show(new RecordsGroupRecordsTableView({model: this.model}));
        }
        else {
            region.empty();
        }

        this.getUI('groupRecordsRowWrapper').toggleClass('hidden', !show);
    }
});


let RecordsGroupHeaderView = views.MinicashView.extend({
    tagName: 'tr',
    template: Hb.compile(`
        <td class="select-item-checkbox">
          {{#ifgt records.length 1}}
            <button data-spec="toggle-records-group" type="button"
                    class="btn btn-default btn-xs" aria-label="Left Align">
              <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
            </button>
          {{/ifgt}}
        </td>

        <td role="button">{{created_dt}}</td>

        <td class="delta" role="button">{{record_mode_sign mode}}{{decimal total_delta}}</td>

        <td role="button">{{record_account asset_from asset_to}}</td>

        <td role="button">
          <strong>{{tags_names shared_tags trailComma="1"}}</strong>{{tags_names individual_tags}}
        </td>

        <td role="button">
            Description
        </td>

    `),

    ui: {
        toggleRecordsGroupBtn: 'button[data-spec="toggle-records-group"]',
    },

    events: {
        'click @ui.toggleRecordsGroupBtn': 'toggleRecordsGroup',
    },

    _recordsGroupOpen: false,

    toggleRecordsGroup() {
        let $toggleIcon = this.getUI('toggleRecordsGroupBtn').children('span');
        this._recordsGroupOpen = !this._recordsGroupOpen;
        $toggleIcon.toggleClass('glyphicon-plus', !this._recordsGroupOpen);
        $toggleIcon.toggleClass('glyphicon-minus', this._recordsGroupOpen);
        this.triggerMethod('toggleRecordsGroup', this._recordsGroupOpen);
    },

});


let RecordsGroupRecordsTableView = views.MinicashView.extend({
    tagName: 'table',
    className: 'table table-striped table-fixed',
    attributes: {
        'data-spec': 'records_group_table',
    },

    template: Hb.compile(`
        <table>
          <thead>
            <tr>
              <th class="select-item-checkbox"><!-- padding column --></th>
              <th class="select-item-checkbox">
                <input type="checkbox" value="">
              </th>

              <th class="delta">
                <div class="wrap">
                  Expense
                </div>
              </th>

              <th class="tags">
                <div class="wrap">
                  Tags
                </div>
              </th>

              <th>
                <div class="wrap">
                  Description
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
          </tbody>
        </table>
    `),

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
    template: Hb.compile(`
        <td class="select-item-checkbox"><!-- padding column --></td>
        <td class="select-item-checkbox">
          <input data-spec="select-record" type="checkbox" value="">
        </td>

        <td>{{decimal delta}}</td>
        <td>
          {{#each tags}}
            {{this}}{{#ifnot @last}}, {{/ifnot}}
          {{/each}}
        </td>
        <td>{{description}}</td>
    `),
});


/* ========= Handlebars ========= */
/* ============================== */

Hb.registerPartial(
    'components/records_filter',
    require('templates/components/records_filter.hbs')
);


Hb.registerHelper('record_account', (assetFrom, assetTo, options) => {
    assetFrom = minicash.collections.assets.get(assetFrom);
    assetTo = minicash.collections.assets.get(assetTo);

    let EMPTY = '';

    let assetFromName = assetFrom ? assetFrom.get('name') : EMPTY;
    let assetToName = assetTo ? assetTo.get('name') : EMPTY;

    return `${assetFromName} ➡ ${assetToName}`.trim();
});



Hb.registerHelper('record_mode_sign', function (mode, options) {
    let sign = '';
    switch (mode) {
    case minicash.CONTEXT.RECORD_MODES.EXPENSE.value: sign = '−'; break;
    case minicash.CONTEXT.RECORD_MODES.INCOME.value: sign = '+'; break;
    case minicash.CONTEXT.RECORD_MODES.TRANSFER.value: sign = '∓'; break;
    default: sign = 'ERROR';
    }
    return sign;
});


Hb.registerHelper('record_tags_names', function(recData, options) {
    let tagsNames;

    if (recData.tags_names == null) {
        tagsNames = getTagsNames(recData.tags);
    } else {
        tagsNames = recData.tags_names;
    }

    tagsNames = _.sortBy(tagsNames);
    return tagsNames.join(', ');
});


Hb.registerHelper('tags_names', function(tags, options) {
    /* options.hash: {
           trailComma: "0" | "1"  // add trailing comma to result
       }
    */
    let tagsNames = getTagsNames(tags);
    tagsNames = _.sortBy(tagsNames);
    let ret = tagsNames.join(', ');

    if (options.hash.trailComma && ret) {
        ret += ', ';
    }

    return ret;
});


Hb.registerHelper('tag_name', function(id, options) {
    let tag = minicash.collections.tags.get(id);
    if (tag) {
        return tag.get('name');
    } else {
        return 'ERROR:tag_name()';
    }
});


function getTagsNames(tags) {
    let tagsNames = [];

    for (let tagId of tags) {
        let tag = minicash.collections.tags.get(tagId);
        let tagName;

        if (tag) {
            tagName = tag.get('name');
        } else {
            tagName = 'ERROR:tag_name()';
        }

        tagsNames.push(tagName);
    }

    return tagsNames;
}

/* --------------------------------------------------------- */
