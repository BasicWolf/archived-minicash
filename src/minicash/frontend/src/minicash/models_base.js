'use strict';

/* global $,_,minicash, */

import Bb from 'backbone';
import PageableCollection from 'backbone.paginator';

export let MinicashModel = Bb.Model.extend({
    serverAttributes: null,

    save(attrs, options) {
        attrs = attrs || this.toJSON();
        options = options || {};

        // if model defines serverAttributes, replace attrs with trimmed version
        if (_.isNull(this.serverAttributes)) {
            attrs = _.pick(attrs, this.serverAttributes);
        }

        return Bb.Model.prototype.save.call(this, attrs, options);
    },

    serialize() {
        let data = _.clone(this.attributes);
        data['id'] = this.id;
        return data;
    }
});


let SerializableCollectionMixin = {
    serialize() {
	    return this.map( (model) => {
            if (model instanceof MinicashModel)
                return model.serialize();
            else
                return _.clone(model.attributes);
        });
    }
};

let MassDeleteCollectionMixin = {
    massDeleteUrl: function() { throw 'NotImplemented'; },

    delete: function(modelsOrPks=null) {
        let pks = modelsOrPks.map((modelOrPk) => {
            return modelOrPk instanceof Bb.Model ? modelOrPk.id : modelOrPk;
        });

        let url = _.isFunction(this.massDeleteUrl) ? this.massDeleteUrl() : this.massDeleteUrl;

        let dfd = $.post({
            url: url,
            data: JSON.stringify({'pks': pks}),
            contentType : 'application/json',
        });

        dfd.done((data) => {
            let remPks = data.pks || [];
            this.remove(remPks);
        });

        return dfd;
    }
};


let SaveCollectionMixin = {
    save: function( options ) {
        var success = options.success;
        var error = options.error;
        var complete = options.complete;

        options.success = (response, status, xhr) => {
            this.trigger('sync', this, response, options);
            if (success) {
                success.apply(this, arguments);
            }
        };

        options.error = (response, status, xhr) => {
            this.trigger('error', this, response, options);
            if (error) {
                error.apply(this, arguments);
            }
        };

        options.complete = (response, status, xhr) => {
            if (complete) {
                complete.apply(this, arguments);
            }
        };

        return Bb.sync('create', this, options);
    }
};


export let MinicashCollection = Bb.Collection.extend({
    queryArgs: {},

    search: function(searchArgs, options) {
        searchArgs = searchArgs || this.queryArgs;

        let defaults = {
            data: searchArgs,
            traditional: true,
        };

        let attrs = _.extend({}, defaults, options);
        return this.fetch(attrs);
    },
});
_.extend(
    MinicashCollection.prototype,
    SerializableCollectionMixin,
    MassDeleteCollectionMixin,
    SaveCollectionMixin
);


export let MinicashPageableCollection = PageableCollection.extend({
    queryArgs: {},

    state: {
        firstPage: 1,
        pageSize: minicash.CONTEXT.settings.PAGINATOR_DEFAULT_PAGE_SIZE,
    },

    queryParams: {
        currentPage: 'page',
        pageSize: 'page_size',
        totalRecords: 'count',
        totalPages: 'num_pages',
    },

    parseState(resp, queryParams, state, options) {
        let newState = Bb.PageableCollection.prototype.parseState.apply(this, arguments);

        // add `previousPage` and `nextPage` to state - handy when rendering
        newState.previousPage = null;
        newState.nextPage = null;

        if (!_.isNull(newState.currentPage)) {
            newState.previousPage = newState.currentPage - 1;
            newState.nextPage = newState.currentPage + 1;
        }
        return newState;
    },

    search: function(searchArgs, options) {
        searchArgs = searchArgs || _.clone(this.queryArgs);

        let defaults = {
            data: searchArgs,
            traditional: true,
        };

        let attrs = _.extend({}, defaults, options);
        return this.getPage(this.state.firstPage, attrs);
    },

    getPage: function(page, options) {
        if (_.isEmpty(options) && !_.isEmpty(this.queryArgs)) {
            options = {
                data: _.clone(this.queryArgs),
                traditional: true,
            };
        }

        return Bb.PageableCollection.prototype.getPage.call(this, page, options);
    }
});
_.extend(
    MinicashPageableCollection.prototype,
    SerializableCollectionMixin,
    MassDeleteCollectionMixin,
    SaveCollectionMixin
);
