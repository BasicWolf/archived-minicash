'use strict';

import Mn from 'backbone.marionette';

import RouteReverser from 'route-reverser';


export let TabsRouter = Mn.AppRouter.extend(RouteReverser).extend({
    appRoutes: {
        '': 'home',
        'tabs/records(/)(:id)': 'records',
        'tabs/record(/)(:id)': 'new_record',
        'tabs/assets(/)(:id)': 'assets',
        'tabs/asset(/)(:id)': 'new_asset',
        'tabs/tags(/)(:id)': 'tags',
        'tabs/tag(/)(:id)': 'new_tag',
    },
});
