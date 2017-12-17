'use strict';

import BootstrapVue from 'bootstrap-vue';

import Vue from 'vue';

import App from '~/App';

import router from '~/router';


Vue.use(BootstrapVue);

import 'bootstrap-vue/dist/bootstrap-vue.css';


new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }
});
