'use strict';

import Hb from 'handlebars/runtime';

import * as models from 'minicash/models';
import {tr} from 'minicash/utils';

/* global minicash */

/* Handlebars helpers */
/*--------------------*/

Hb.registerHelper('tr', function(s, options) {
    /* Translation wrapper */
    return tr(s);
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


Hb.registerHelper('record_tags_names', function(recData, options) {
    let tagsNames = [];

    if (recData.tags_names == null) {
        for (let tagId of recData.tags) {
            let tag = minicash.collections.tags.get(tagId);
            let tagName;

            if (tag) {
                tagName = tag.get('name');
            } else {
                tagName = 'ERROR:tag_name()';
            }

            tagsNames.push(tagName);
        }
    } else {
        tagsNames = recData.tags_names;
    }

    return tagsNames.join(', ');
});


Hb.registerHelper('tag_name', function(id, options) {
    let tag = minicash.collections.tags.get(id);
    if (tag) {
        return tag.get('name');
    } else {
        return 'ERROR:tag_name()';
    }
});

