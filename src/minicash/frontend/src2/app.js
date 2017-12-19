'use strict';

import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue';

import App from '~/App';
import router from '~/router';
import store from '~/store';


Vue.use(BootstrapVue);
import 'bootstrap-vue/dist/bootstrap-vue.css';


new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: { App }
});
