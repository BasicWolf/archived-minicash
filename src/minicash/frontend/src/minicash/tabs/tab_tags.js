'use strict';

/* global _,$,minicash,require */

import Hb from 'handlebars/runtime';
import Mn from 'backbone.marionette';
import * as bootbox from 'bootbox';

import {TabPanelView, TabModel} from 'minicash/components/tabbar';
import {tr} from 'minicash/utils';
import {TagTab} from './tab_tag';


export let TagsTab = TabModel.extend({
    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            title: 'Tags',
            name: 'tags',
            singleInstance: true,
            viewClass: TagsTabPanelView,
        });
    },
});


let TagsTabPanelView = TabPanelView.extend({
    constructor: function() {
        this.collection = minicash.collections.tags;
        TabPanelView.prototype.constructor.apply(this, arguments);
    },

    template: require('templates/tab_tags/tab_tags.hbs'),

    ui: {
        newTagBtn: 'button[data-spec="start-new-tag"]',
        deleteTagBtn: 'button[data-spec="delete-tag"]',
    },

    regions: {
        tagsTableRegion: {el: '[data-spec="tags-table-region"]'},
    },

    events: {
        'click @ui.newTagBtn': 'startNewTag',
        'click @ui.deleteTagBtn': 'deleteSelectedTags',
    },

    childViewEvents: {
        'selected:tags:change': 'onSelectedTagsChange',
    },

    onRender: function() {
        this.showChildView('tagsTableRegion', new TagsTableView({collection: this.collection})) ;
    },

    startNewTag: function() {
        minicash.navigateTo('tab_new_tag');
    },

    deleteSelectedTags: function() {
        let dfdDoDelete = $.Deferred();

        bootbox.confirm({
            message: tr('Are you sure you want to delete the selected tags?'),
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
            let selectedTags = this.getSelectedTags();
            this.collection.delete(selectedTags);
        });

    },

    onChildviewPageChange: function(pageNumber) {
        minicash.collections.tags.getPage(pageNumber);
    },

    onSelectedTagsChange: function(selectedTags) {
        this.uiEnable('deleteTagBtn', !!selectedTags.length);
    },

    getSelectedTags: function() {
        let tagsTableView = this.getChildView('tagsTableRegion');
        return tagsTableView.getSelectedTags();
    },
});


let TagsTableView = Mn.NextCollectionView.extend({
    tagName: 'table',
    className: 'table table-striped',

    attributes: {
        "data-spec": "tags-table",
        "width": "100%",
    },

    childView: () => TagRowView,

    onRender: function() {
        let template = require('templates/tab_tags/tags_table_head.hbs');
        let $tableHead = $(template());
        this.$el.prepend($tableHead);
    },

    onChildviewTagSelectedChange: function(childView, e) {
        this.triggerMethod('selected:tags:change', this.getSelectedTags());
    },

    getSelectedTags: function() {
        let selectedTags = this.children.filter((c) => c.isSelected());
        let selectedTagModels = _.map(selectedTags, 'model');
        return selectedTagModels;
    },
});


let TagRowView = Mn.View.extend({
    tagName: 'tbody',
    template: require('templates/tab_tags/tag_row.hbs'),

    ui: {
        activeRowArea: 'td[role="button"]',
        chkTag: 'input[data-spec="select-tag"]',
    },

    events: {
        'click @ui.activeRowArea': 'editTag',
    },

    modelEvents: {
        'change': 'render',
    },

    triggers: {
        'change @ui.chkTag': 'tag:selected:change',
    },

    regions: {
        tagDataRegion: {
            el: '[data-spec="tag-data-region"]',
            replaceElement: true,
        }
    },

    isSelected: function() {
        return this.getUI('chkTag').is(':checked');
    },

    editTag: function() {
        minicash.navigateTo('tab_tags', {id: this.model.id});
    },
});
