'use strict';

import Mn from 'backbone.marionette';

import RouteReverser from 'route-reverser';


export let TabsRouter = Mn.AppRouter.extend(RouteReverser).extend({
    appRoutes: {
        '': 'home',
        'tabs/records(/)(:id)': 'records',
        'tabs/record(/)(:id)': 'new_record'
    },
});
