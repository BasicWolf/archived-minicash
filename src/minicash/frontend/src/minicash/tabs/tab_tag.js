'use strict';

/* global $,_,minicash,require */

import Radio from 'backbone.radio';

import * as models from 'minicash/models';
import * as utils from 'minicash/utils';
import {TabPanelView, TabModel} from 'minicash/components/tabbar';
import {tr} from 'minicash/utils';


let tagsChannel = Radio.channel('tags');


export let TagTab = TabModel.extend({
    defaults: function() {
        let parentDefaults = TabModel.prototype.defaults.apply(this, arguments);

        return _.extend(parentDefaults, {
            name: 'tag_' + utils.generateId(),
            adding: false,
            viewClass: TagTabPanelView,
        });
    },

    initialize: function() {
        let title = this.get('tagId') ? tr('Edit tag') : tr('New tag');
        this.set('title', title);
        TabModel.prototype.initialize.apply(this, arguments);
    },
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

    modelEvents: {
        'change:tag': 'render'
    },

    initialize: function() {
        // load bound tag
        if (this.model.get('tagId')) {
            let tag = new models.Tag({pk: this.model.get('tagId')});
            tag.fetch().then(() => {
                this.model.set('tag', tag);
            });
        } else {
            this.model.set('tag', new models.Tag());
        }
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
            return utils.rejectedPromise();
        }

        minicash.status.show(tr('Saving tag'));
        this.lockControls();

        let tag = this.model.get('tag');
        let saveDfd = tag.save(saveData, {wait: true});

        saveDfd.done(() => {
            tagsChannel.trigger('model:save', tag);
            this.model.destroy();
        }).fail((response) => {
            this.validator.showErrors(response.responseJSON);
            this.unlockControls();
        }).always(() => {
            minicash.status.hide();
        });

        return saveDfd.promise();
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
