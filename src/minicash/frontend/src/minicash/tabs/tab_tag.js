'use strict';

/* global $,_,minicash,require,tr */

import {TabPanelView, TabModel} from 'minicash/components/tabbar';
import * as utils from 'minicash/utils';


export let TagTab = TabModel.extend({
    constructor: function(attributes) {
        if (attributes.adding) {
            attributes['title'] = tr('New tag');
        } else {
            attributes['title'] = tr('Edit tag');
        }

        TabModel.apply(this, arguments);
    },

    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            name: 'tag_' + utils.generateId(),
            adding: false,
            viewClass: TagTabPanelView,
        });
    },

    serializeModel: function() {
        let renderData = TabPanelView.prototype.serializeModel.apply(this, arguments);
        return renderData;
    }
});


export let TagTabPanelView = TabPanelView.extend({
    validator: null,

    template: require('templates/tab_tags/tab_tag.hbs'),

    ui: {
        saveBtn: 'button[data-spec="save"]',
        cancelBtn: 'button[data-spec="cancel"]',
        form: 'form',
    },

    events: {
        'click @ui.saveBtn': 'onSaveBtnClick',
        'click @ui.cancelBtn': 'onCancelBtnClick',
    },

    serializeModel: function() {
        let renderData = TabPanelView.prototype.serializeModel.apply(this, arguments);
        renderData.tag = (renderData.tag && renderData.tag.serialize() || {});
        return renderData;
    },

    onRender: function() {
        this.initializeValidator();
    },

    initializeValidator: function() {
        this.validator = this.getUI('form').validate({
            rules: {
                name: {required: true},
            },
            messages: {
                name: tr("Please enter a valid name"),
            },
        });
    },

    onSaveBtnClick: function() {
        this.saveForm();
    },

    onCancelBtnClick: function() {
        this.model.destroy();
    },

    saveForm: function() {
        let saveData = this._collectFormData();
        if (_.isEmpty(saveData)) {
            return;
        }

        let dfd = $.Deferred(() => {
            minicash.status.show();
        });
        dfd.then(() => {
            this.model.destroy();
        }).fail((errors) => {
            this.validator.showErrors(errors);
            this.unlockControls();
        }).always(() => {
            minicash.status.hide();
        });

        let saveOptions = {
            wait: true,
            success: () => dfd.resolve(),
            error: (model, response, options) => {
                dfd.reject(response.responseJSON);
            },
        };

        let tag = this.model.get('tag');
        if (tag) {
            tag.save(saveData, saveOptions);
        } else {
            minicash.collections.tags.create(saveData, saveOptions);
        }
    },

    _collectFormData: function() {
        let NO_DATA = {};

        if (!this.validator.form()) {
            return NO_DATA;
        }

        let formData = this.getUI('form').serializeForm();
        return formData;
    },

    lockControls: function() {
        return this.uiDisable(['saveBtn', 'cancelBtn']);
    },

    unlockControls: function() {
        return this.uiEnable(['saveBtn', 'cancelBtn']);
    },
}); // TagTabPanelView
