'use strict';

/* global _,minicash */

import Hb from 'handlebars';
import Mn from 'backbone.marionette';

import * as models from 'minicash/models';
import {tr} from 'minicash/utils';


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


export let MinicashView = Mn.View.extend({});
_.extend(MinicashView.prototype, UIEnableDisableMixin);


export let MinicashBehavior = Mn.Behavior.extend({});
_.extend(MinicashBehavior.prototype, UIEnableDisableMixin);


export let TooltipBehavior = Mn.Behavior.extend({
    onRender: function() {
        this.$el.find('[data-toggle="tooltip"]').tooltip();
    }
});


/* ------- Handlebars helpers -------- */
/*-------------------------------------*/
Hb.registerHelper('tr', function(s, options) {
    /* Translation wrapper */
    return tr(s);
});


Hb.registerHelper('context', function (keys, options) {
    let val = minicash.CONTEXT;

    for (let key of keys.split('.')) {
        val = val[key];
    }
    return val;
});
