import Hb from 'handlebars/runtime';
import * as models from 'minicash/models';

/* global minicash,tr */

/* Handlebars helpers */
/*--------------------*/

Hb.registerHelper('tr', function(v) {
    /* Translation wrapper */
    return tr(this);
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


Hb.registerHelper('context', function (keys, options) {
    let val = minicash.CONTEXT;

    for (let key of keys.split('.')) {
        val = val[key];
    }
    return val;
});


Hb.registerHelper('tag_name', function(id, options) {
    let tag = minicash.collections.tags.get(id);
    if (tag) {
        return tag.get('name');
    } else {
        return 'ERROR:tag_name()';
    }
});
