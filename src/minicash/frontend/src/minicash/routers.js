'use strict';

import Mn from 'backbone.marionette';



export let TabsRouter = Mn.AppRouter.extend({
    appRoutes: {
        '': 'openHome',
        'tabs/:tabName': 'openTab',
        'tabs/:tabName/:id': 'openTab'
    },
});
