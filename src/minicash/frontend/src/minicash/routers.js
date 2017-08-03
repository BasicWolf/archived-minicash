'use strict';

import Mn from 'backbone.marionette';

import {TabsController} from 'minicash/controllers/tabs_controller';


export let TabsRouter = Mn.AppRouter.extend({
    controller: new TabsController,

    appRoutes: {
        'tabs/:tabName': 'openTab'
    },
});
