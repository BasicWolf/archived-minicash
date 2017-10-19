'use strict';

/* global _,$,minicash,require */

import Bb from 'backbone';
import Hb from 'handlebars/runtime';
import Mn from 'backbone.marionette';


export let PaginatorModel = Bb.Model.extend({
    defaults: function() { },
});


export let PaginatorView = Mn.View.extend({
    // required, so that Marionette would call serialzeModel() instead
    // of serializeCollection.
    model: {},

    getTemplate: function() {
        if (this.collection.state.totalRecords != null) {
            return require('templates/components/paginator.hbs');
        } else {
            return function() {};
        }
    },

    ui: {
        pageButtons: 'a[data-spec="page-button"]',
    },

    events: {
        'click @ui.pageButtons': 'onPageButtonClick',
    },

    collectionEvents: {
        'update': 'render',
    },

    serializeModel: function() {
        return _.clone(this.collection.state);
    },

    onPageButtonClick: function (e) {
        e.preventDefault();
        let $button = $(e.target);

        let pageNumberTxt = $button.attr('data-page-number');
        if (pageNumberTxt) {
            let pageNumber = parseInt(pageNumberTxt);
            this.triggerMethod('page:change', pageNumber);
        }
    },

});


/* ------ Handlebar helpers ------ */
Hb.registerHelper('paginator_buttons', function(totalPages, currentPage, options) {
    let out = '';
    let invisibleDisplayedFlag = false;

    for (let i = 1; i < totalPages + 1; i++) {
        let visible = _pageBtnVisible(i, currentPage, totalPages);

        let active = i === currentPage ? 'active' : '';
        out += `<li class=\"${active}\">`;
        if (visible) {
            let url = minicash.url('tab_records', {}, {page: i});
            out += `<a href=\"${url}\" data-spec=\"page-button\" data-page-number=\"${i}\">${i}</a>`;
            invisibleDisplayedFlag = false;
        }
        else if (!invisibleDisplayedFlag) {
            out += '<a href="javascript:void(0);">&hellip;</a>';
            invisibleDisplayedFlag = true;
        }
        out += "</li>";
    }

    return out;
});

function _pageBtnVisible (page, currentPage, totalPages) {
    /* Ensure that 7 pages buttons are visible when count is >= 7 */
    let all = totalPages <= 7;
    let firstOrLast = page === 1 || page === totalPages;
    let beginOrEnd = page <= 5 && currentPage <= 4 || page >= totalPages - 4 && currentPage >= totalPages - 3;
    let current = page === currentPage;
    let closest = page >= currentPage - 1  && page <= currentPage + 1;
    return all || firstOrLast || current || closest || beginOrEnd;
}
/*=================================*/
