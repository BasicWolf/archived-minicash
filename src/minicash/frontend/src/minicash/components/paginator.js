'use strict';

/* global _,$,require */

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
    let pageBtnVisible = function (page) {
        let firstOrLast = page === 1 || page === totalPages;
        let current = page === currentPage;
        let leftBoundary = currentPage < 3 && (page === 2 || page === totalPages - 1);
        let rightBoundary = currentPage >= totalPages - 2 && (page === 2 || page === totalPages - 1);
        return firstOrLast || current || leftBoundary || rightBoundary;
    };

    for (let i = 1; i < totalPages + 1; i++) {
        let visible = pageBtnVisible(i);

        let active = i === currentPage ? 'active' : '';
        out += `<li class=\"${active}\">`;
        if (visible) {
            out += `<a href=\"#\" data-spec=\"page-button\" data-page-number=\"${i}\">${i}</a>`;
            invisibleDisplayedFlag = false;
        }
        else if (!invisibleDisplayedFlag) {
            out += '<a href="#">...</a>';
            invisibleDisplayedFlag = true;
        }
        out += "</li>";
    };

    return out;
});
/*=================================*/
