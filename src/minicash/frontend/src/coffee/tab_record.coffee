import 'tagsinput'

import {TabPanelView, TabModel} from './tabbar'
import * as utils from './utils'
import * as views from './views'


export RecordTab = TabModel.extend
    defaults: ->
        title: 'New record'
        name: 'new_record_' + utils.generateId()
        viewClass: NewRecordTabPanelView


export NewRecordTabPanelView = TabPanelView.extend
    validator: null

    template: require('templates/tab_record.hbs')

    ui:
        saveBtn: 'button[data-spec="save"]'
        cancelBtn: 'button[data-spec="cancel"]'
        modeSelect: 'select[name="mode"]'
        createdDateInput: 'input[name="created_date"]'
        tagsInput: 'input[name="tags"]'
        toAssetSelect: 'select[name="asset_to"]'
        fromAssetSelect: 'select[name="asset_from"]'
        form: 'form'

    events:
        'click @ui.saveBtn': 'onSaveBtnClick'
        'click @ui.cancelBtn': 'onCancelBtnClick'
        'change @ui.modeSelect': 'onModeChange'

    onRender: ->
        @initializeDateTimePicker()
        @initializeValidator()
        @renderModeSelectState()
        @renderAssets()
        @renderTags()

    initializeDateTimePicker: ->
        options =
            showTodayButton: true
            allowInputToggle: true
            format: minicash.CONTEXT.user.dtFormat

        createdDateInputWrapper = @getUI('createdDateInput').parent()
        createdDateInputWrapper.datetimepicker(options)
        # set initial value in textbox
        nowStr = moment().format(options.format)
        @getUI('createdDateInput').val(nowStr)

    initializeValidator: ->
        @validator = @getUI('form').validate
            rules:
                createdDate: {required: true}
                delta: {required: true}
            messages:
                createdDate: tr("Please enter a valid date/time")
                delta: tr("Please enter a valid expense value")

    onSaveBtnClick: ->
        @saveForm()

    onCancelBtnClick: ->
        @model.destroy()

    onModeChange: (e) ->
        @renderModeSelectState($(e.target).val())

    renderModeSelectState: (val) ->
        val ?= @getUI('modeSelect').val()
        val = parseInt(val)

        RECORD_MODES = minicash.CONTEXT.RECORD_MODES

        showTo = false
        showFrom = false

        switch val
            when RECORD_MODES.INCOME then showTo = true
            when RECORD_MODES.EXPENSE then showFrom = true
            when RECORD_MODES.TRANSFER then showTo = showFrom = true

        @getUI('fromAssetSelect').parentsUntil('form', '.form-group').toggle(showFrom)
        @getUI('toAssetSelect').parentsUntil('form', '.form-group').toggle(showTo)

    renderAssets: ->
        $selects = [@getUI('fromAssetSelect'), @getUI('toAssetSelect')]
        # TODO: keep the old selected values shown
        for $sel in $selects
            $sel.empty()

        minicash.collections.assets.forEach (asset) ->
            for $sel in $selects
                $sel.append(new Option(asset.get('name'), asset.id))
            return

    renderTags: ->
        @getUI('tagsInput').tagsinput
            tagClass: 'label label-primary'
            typeaheadjs:
                displayKey: 'name',
                valueKey: 'name'
                source: minicash.collections.tags.bloodhound.adapter()


    saveForm: ->
        if not @validator.form()
            return

        formData = @getUI('form').serializeForm()
        formData.tags = @getUI('tagsInput').tagsinput('items')

        RECORD_MODES = minicash.CONTEXT.RECORD_MODES
        switch parseInt(formData.mode)
            when RECORD_MODES.INCOME then formData.asset_to = null
            when RECORD_MODES.EXPENSE then formData.asset_from = null
            when RECORD_MODES.TRANSFER then ;
            else throw 'Invalid record mode'

        minicash.status.show()
        rec = minicash.collections.records.create(formData, {
            wait: true
            success: =>
                minicash.status.hide()
                @unlockControls()
                @model.destroy()
            error: =>
                minicash.status.hide()
                @unlockControls()
        })

    lockControls: ->
        @uiDisable(['saveBtn', 'cancelBtn'])

    unlockControls: ->
        @uiEnable(['saveBtn', 'cancelBtn'])

_.extend(NewRecordTabPanelView.prototype, views.UIMixin);
