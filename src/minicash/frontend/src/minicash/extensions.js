'use strict';

/* global _,$,jQuery,minicash,tr,require */

import Bb from 'backbone';
import Decimal from 'decimal.js';
import Hb from 'handlebars/runtime';

// Temporal stub for translation function
window.tr = function(s) {return  s;};

/*--------- Handlebars -----------*/
/*================================*/

/* ---------- Partials ----------- */

let _partial = require('templates/components/records_filter.hbs');
Hb.registerPartial('components/records_filter', _partial);

/* ---------- Helpers ------------ */

Hb.registerHelper('tr', function(v) {
    /* Translation wrapper */
    return tr(this);
});

Hb.registerHelper('ifnot', function(v, options) {
    return v? options.inverse(this) : options.fn(this);
});

Hb.registerHelper('ifdef', function(v, options) {
    return v != null ? options.fn(this) : options.inverse(this);
});


Hb.registerHelper('ifeq', function(v, v2, options) {
    return v === v2 ? options.fn(this) : options.inverse(this);
});


Hb.registerHelper('iflte', function(v, v2, options) {
    return v <= v2 ? options.fn(this) : options.inverse(this);
});


Hb.registerHelper('decimal', function(options) {
    let val = new Decimal(options.fn(this));
    let text = val.toFixed(2).toString();
    return new Hb.SafeString(text);
});

Hb.registerHelper('times', function(n, start=null, options) {
    start = start || 0;
    let out = '';
    let data = null;

    if (options.data) {
        let data = Hb.createFrame(options.data);
    }

    for (let i = start; i < n; i++) {
        if (data) {
            data.index = i;
        }

        out += options.fn(i, {data: data});
    }
    return out;
});

Hb.registerHelper('record_mode_sign', function (mode, options) {
    let sign = '';
    switch (mode) {
    case minicash.CONTEXT.RECORD_MODES.EXPENSE.value: sign = '−'; break;
    case minicash.CONTEXT.RECORD_MODES.INCOME.value: sign = '+'; break;
    case minicash.CONTEXT.RECORD_MODES.TRANSFER.value: sign = ''; break;
    default: sign = 'ERROR';
    }
    return sign;
});

/* Minicash helpers */
/*------------------*/
Hb.registerHelper('context', function (keys, options) {
    let val = window.minicash.CONTEXT;

    for (let key of keys.split('.')) {
        val = val[key];
    }
    return val;
});
/*================================*/


(function($) { $.fn.extend({
    serializeForm: function (options) {
        let defaults = {
            forceArray: false,
        };
        let o = $.extend(defaults, options);
        let ret = [];

        this.each(function() {
            let $obj = $(this);
            let arrayData = $obj.serializeArray();
            let formData = _.chain(arrayData)
                .indexBy('name')
                .mapObject((val, key) => val.value)
                .value();
            ret.push(formData);
        });

        if (ret.length == 1 && !o.forceArray) {
            return ret[0];
        } else {
            return ret;
        }
    }
}); })(jQuery);


/*------ CSRF ---------- */

let getCookie = function (name) {
    let cookieValue = null;
    if (document.cookie && document.cookie != '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

let csrfToken = getCookie('csrftoken');

let csrfSafeMethod = function (method) {
    // these HTTP methods do not require CSRF protection
    return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
};

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        /*===== CSRF =====*/
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrfToken);
        }

        /*===== Trailing slash =====*/
        if (!this.crossDomain) {
            let url = settings.url;
            let lastChar = url.slice(-1);
            if (lastChar != '/') {
                settings.url = url + '/';
            }
        }

        /*====== UI ======*/
        minicash.status.show();
    },

    complete: function(xhr, status) {
        handleAjaxError(xhr, status);
        minicash.status.hide();
    },
});

let handleAjaxError = function(xhr, status) {
    const HTTP_500_INTERNAL_SERVER_ERROR = 500;

    switch(status) {
    case 'error':
        console.debug(`AJAX Error: ${xhr.responseText}`);

        if (xhr.status == HTTP_500_INTERNAL_SERVER_ERROR) {
            let errorMessage = tr('Unfortunately an application error has happened. <br>Please try again later.');
            if (xhr.responseJSON && xhr.responseJSON.detail) {
                errorMessage = xhr.responseJSON.detail;
            }

            minicash.notify.error(errorMessage);
        }

        break;
    }
};

/*================================*/
