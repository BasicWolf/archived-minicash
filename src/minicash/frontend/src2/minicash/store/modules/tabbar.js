'use strict';

import Vuex from 'vuex';

import * as types from '../mutation-types';

const state = {
    tabs: [],
    counter: 0,
};


const getters = {

};


const mutations = {
    [types.ADD_TAB] (state, tab) {
        state.tabs.push(tab);
    },

    [types.INCREASE_TAB_COUNTER] (state) {
        state.counter +=1;
    }
};


const actions = {
    addTab: ({commit, state}, tab) => {
        commit(types.INCREASE_TAB_COUNTER);
        tab = {id: state.counter, ...tab};
        commit(types.ADD_TAB, tab);
    }
};


export default {
    state,
    getters,
    actions,
    mutations
};
