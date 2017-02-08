'use strict';

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
