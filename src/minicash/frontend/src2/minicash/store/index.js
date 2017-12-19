'use strict';

/* global process */

import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';
import Tabbar from './modules/tabbar';

// import * as actions from './actions';
// import * as getters from './getters';

Vue.use(Vuex);

const PRODUCTION = process.env.NODE_ENV === 'production';

export default new Vuex.Store({
    strict: PRODUCTION,

    plugins: PRODUCTION ? [
        // production-time plugins
    ] : [
        // dev-time plugins
        createLogger(),
    ],

    modules: {
        tabbar: Tabbar,
    }
});
