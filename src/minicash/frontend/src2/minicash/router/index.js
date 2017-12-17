'use strict';

import Vue from 'vue';
import Router from 'vue-router';
import Tabbar from '~/components/page/tabbar';
import Home from '~/components/tabs/home';

Vue.use(Router);

const DEFAULT_TAB_NAME = 'home';

let routes = [
    {
        path: '/',
        redirect: '/tabs/home',
        name: 'home',
    },

    {
        path: '/tabs/:name',
        component: Tabbar,

        children: [
            {
                path: 'home',
                component: Home,
            },
        ],

        props (route) {
            return {
                tabComponentIs: route.params['name'] || DEFAULT_TAB_NAME,
            };
        }
    }
];

export default new Router({
    mode: 'history',
    routes: routes,
});
