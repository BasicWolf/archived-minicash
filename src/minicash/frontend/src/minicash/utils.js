'use strict';

/* global $,_,minicash,tr */

import Bb from 'backbone';
import Decimal from 'decimal.js';
import Mn from 'backbone.marionette';
import PageableCollection from 'backbone.paginator';

import 'moment/locale/fi';

/* --- CONSTANTS --- */
/*-------------------*/
export let KEYS = {
    ENTER: 13,
    ESCAPE: 27,
}


/* --- NOTIFICATIONS AND STATUS --- */
/* ---------------------------------*/
export let notifier = (function() {
    let invoke = function(message, type='info') {
        $.notify({
            message: message
        }, {
            type: type,
            allow_dismiss: true,
            offset: {
		        x: 5,
		        y: 55,
	        },
            placement: {
		        from: "top",
		        align: "right"
	        },
        });
    };

    return {
        info: (message) => invoke(message, 'info'),
        success: (message) => invoke(message, 'success'),
        warning: (message) => invoke(message, 'warning'),
        error: (message) => invoke(message, 'danger'),
    };
})();

export let status = {
    show: function(text=null) {
        text = text || tr('Loading...');

        let $el = $('#minicash_status');
        $el.find('div[data-spec="minicash-status-text"]').text(text);
        $el.show();
    },
    hide: function() {
        $('#minicash_status').fadeOut(500);
    }
};

/* ==================================================================================================== */


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


let SerializeCollectionMixin = {
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
    delete: function(modelsOrPks=null) {
        let pks = modelsOrPks.map((modelOrPk) => {
            return modelOrPk instanceof Bb.Model ? modelOrPk.id : modelOrPk;
        });

        let dfd = $.post({
            url: minicash.url('records-mass-delete'),
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
    search: function(searchArgs, options) {
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
    SerializeCollectionMixin,
    MassDeleteCollectionMixin
);


export let BasePageableCollection = Bb.PageableCollection.extend({
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
        let defaults = {
            data: searchArgs,
            traditional: true,
        };

        let attrs = _.extend({}, defaults, options);
        return this.getPage(this.state.firstPage, attrs);
    }
});
_.extend(
    BasePageableCollection.prototype,
    SerializeCollectionMixin,
    MassDeleteCollectionMixin
);


/* ==================================================================================================== */


/* ------ UI HELPERS  ----- */
/*--------------------------*/
export let UnwrappedView = Mn.View.extend({
    onRender() {
        // Get rid of that pesky wrapping-div.
        // Assumes 1 child element present in template.
        this.$el = this.$el.children();
        // Unwrap the element to prevent infinitely
        // nesting elements during re-render.
        this.$el.unwrap();
        this.setElement(this.$el);
    }
});

export let UIEnableDisableMixin = {
    uiEnable: function (names, enable=true) {
        if (!_.isArray(names)) {
            names = [names];
        }

        for (let name of names) {
            if (enable) {
                this.getUI(name).removeAttr('disabled');
            } else {
                this.getUI(name).prop('disabled', true);
            }
        }
    },

    uiDisable: function (names) {
        this.uiEnable(names, false);
    },
};

export let BaseView = Mn.View.extend({});
_.extend(BaseView.prototype, UIEnableDisableMixin);

export let BaseBehavior = Mn.Behavior.extend({});
_.extend(BaseBehavior.prototype, UIEnableDisableMixin);


export let TooltipBehavior = Mn.Behavior.extend({
    onRender: function() {
        this.$el.find('[data-toggle="tooltip"]').tooltip();
    }
});
/* ==================================================================================================== */

/* --- HELPER FUNCTIONS --- */
/*--------------------------*/


// generateId :: Integer -> String
export let generateId = (function () {
    let counter = 0;
    return function internal() {
        counter++;
        return counter;
    };
})();

export function generateRandomId(len) {
    len = len || 40;
    let dec2hex = (dec) => dec.toString(16);
    let arr = new Uint8Array((len) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr).map(dec2hex).join('');
}

export function splitToNonEmpty(s, splitter) {
    return s.split(splitter).filter((s) => s);
}


export function decimalToString(dec) {
    return dec.toPrecision();
}


export function compareStringsAsDecimals(s1, s2) {
    return decimalToString(new Decimal(s1)) === decimalToString(new Decimal(s2));
}


export function compareMoments(momentA, momentB) {
    if (momentA > momentB) {
        return 1;
    } else if (momentA < momentB) {
        return -1;
    }
    return 0;
}


export function getLocale() {
    let supported = ['en'];
    let defaultLang = 'en';
    let lang = null;

    if (navigator.languages != undefined) {
        lang = window.navigator.languages[0];
    } else {
        lang = window.navigator.userLanguage || window.navigator.language;
    }

    if (_.contains(supported, lang)) {
        return lang;
    } else {
        return defaultLang;
    }
}


export let colors = (function() {
    /**
     * HSV to RGB color conversion
     *
     * H runs from 0 to 360 degrees
     * S and V run from 0 to 100
     *
     * Ported from the excellent java algorithm by Eugene Vishnevsky at:
     * http://www.cs.rit.edu/~ncs/color/t_convert.html
     */
    let hsvToRgb = function(h, s, v) {
	    let r, g, b;
	    let i;
	    let f, p, q, t;

	    // Make sure our arguments stay in-range
	    h = Math.max(0, Math.min(360, h));
	    s = Math.max(0, Math.min(100, s));
	    v = Math.max(0, Math.min(100, v));

	    // We accept saturation and value arguments from 0 to 100 because that's
	    // how Photoshop represents those values. Internally, however, the
	    // saturation and value are calculated from a range of 0 to 1. We make
	    // That conversion here.
	    s /= 100;
	    v /= 100;

	    if(s == 0) {
		    // Achromatic (grey)
		    r = g = b = v;
		    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	    }

	    h /= 60; // sector 0 to 5
	    i = Math.floor(h);
	    f = h - i; // factorial part of h
	    p = v * (1 - s);
	    q = v * (1 - s * f);
	    t = v * (1 - s * (1 - f));

	    switch(i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;

		case 1:
			r = q;
			g = v;
			b = p;
			break;

		case 2:
			r = p;
			g = v;
			b = t;
			break;

		case 3:
			r = p;
			g = q;
			b = v;
			break;

		case 4:
			r = t;
			g = p;
			b = v;
			break;

		default: // case 5:
			r = v;
			g = p;
			b = q;
	    }

	    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };

    let makeColorsGradient = function(count) {
        // distribute the colors evenly on the hue range
        let step = 30 / (count - 1);

        let colors = [];
        for (let i = 0; i < count; i++) {
            let [h, s, v] = [
                15 + step * i,
                100 - 50 * (2 * i / count),
                100
            ];

            let [red, green, blue] = hsvToRgb(h, s, v); //100 - (10 * (1 - i / count)));
            colors.push(`rgb(${red},${green},${blue})`);
        }

        return colors;
    };

    return {
        makeColorsGradient: makeColorsGradient,
    };
})();

/* ==================================================================================================== */
