import 'tagsinput'

import {TabPanelView, TabModel} from './tabbar'
import * as utils from './utils'
import * as views from './views'


export RecordTab = TabModel.extend
    defaults: ->
        title: 'New record'
        name: 'new_record_' + utils.generateId()
        viewClass: RecordTabPanelView
        record: null


export RecordTabPanelView = TabPanelView.extend
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

    serializeModel: ->
        renderData = TabPanelView.prototype.serializeModel.apply(this, arguments);
        renderData.record = renderData.record?.serialize()
        renderData.assets = minicash.collections.assets.serialize()
        return renderData

    onRender: ->
        @initializeDateTimePicker()
        @initializeValidator()
        @renderModeSelectState()
        @renderTags()

    initializeDateTimePicker: ->
        options =
            showTodayButton: true
            allowInputToggle: true
            format: minicash.CONTEXT.user.dtFormat

        $dtInput = @getUI('createdDateInput')
        createdDateInputWrapper = $dtInput.parent()
        createdDateInputWrapper.datetimepicker(options)
        # set initial value in textbox
        if $dtInput.val() == ''
            nowStr = moment().format(options.format)
            @getUI('createdDateInput').val(nowStr)

    initializeValidator: ->
        RECORD_MODES = minicash.CONTEXT.RECORD_MODES

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

    renderModeSelectState: (mode) ->
        mode ?= @getUI('modeSelect').val()
        mode = parseInt(mode)

        RECORD_MODES = minicash.CONTEXT.RECORD_MODES

        showTo = false
        showFrom = false

        $fromAssetSelect = @getUI('fromAssetSelect')
        $toAssetSelect = @getUI('toAssetSelect')

        switch mode
            when RECORD_MODES.INCOME.value
                showTo = true
                @getUI('toAssetSelect').rules('add', 'required')
            when RECORD_MODES.EXPENSE.value
                showFrom = true
                @getUI('fromAssetSelect').rules('add', 'required')
            when RECORD_MODES.TRANSFER.value
                showTo = showFrom = true
                @getUI('fromAssetSelect').rules('add', 'required')
                @getUI('toAssetSelect').rules('add', 'required')
            else throw 'Invalid record mode value'

        @getUI('fromAssetSelect').parentsUntil('form', '.form-group').toggle(showFrom)
        @getUI('toAssetSelect').parentsUntil('form', '.form-group').toggle(showTo)


    renderTags: ->
        @getUI('tagsInput').tagsinput
            tagClass: 'label label-primary'
            typeaheadjs:
                displayKey: 'name',
                valueKey: 'name'
                source: minicash.collections.tags.bloodhound.adapter()

    saveForm: ->
        saveData = @_prepareSaveData()


        dfd = $.Deferred ->
            minicash.status.show()
        dfd.then =>
            @model.destroy()
        .always =>
            minicash.status.hide()
            @unlockControls()


        saveOptions =
            wait: true
            success: ->
                dfd.resolve()
            error: ->
                dfd.reject()

        if record = @model.get('record')
            record.save(saveData, saveOptions)
        else
            minicash.collections.records.create(saveData, saveOptions)

    _prepareSaveData: ->
        RECORD_MODES = minicash.CONTEXT.RECORD_MODES

        if not @validator.form()
            return

        formData = @getUI('form').serializeForm()
        formData.tags = @getUI('tagsInput').tagsinput('items')

        # mode either from Form Data, or if not available (control disabled, i.e. editing)
        # - from existing record which is being edited
        mode = formData.mode or (@model.get('record') and @model.get('record').get('mode'))
        switch parseInt(mode)
            when RECORD_MODES.INCOME.value then formData.asset_from = null
            when RECORD_MODES.EXPENSE.value then formData.asset_to = null
            when RECORD_MODES.TRANSFER.value then ; # both assets are used
            else throw 'Invalid record mode'
        return formData

    lockControls: ->
        @uiDisable(['saveBtn', 'cancelBtn'])

    unlockControls: ->
        @uiEnable(['saveBtn', 'cancelBtn'])

_.extend(RecordTabPanelView.prototype, views.UIMixin);
