'use strict';

/* global $,_,minicash, */

import Bb from 'backbone';

export let BaseModel = Bb.Model.extend({
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
            if (model instanceof BaseModel)
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


export let BaseCollection = Bb.Collection.extend({
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
    BaseCollection.prototype,
    SerializableCollectionMixin,
    MassDeleteCollectionMixin
);


export let BasePageableCollection = Bb.PageableCollection.extend({
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
    BasePageableCollection.prototype,
    SerializableCollectionMixin,
    MassDeleteCollectionMixin
);
