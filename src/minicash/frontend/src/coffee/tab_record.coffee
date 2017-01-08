import {TabPanelView, TabModel} from './tabbar'
import * as utils from './utils'

recordTabTemplate = require('templates/tab_record.hbs')


export RecordTab = TabModel.extend
    defaults: ->
        title: 'New record'
        name: 'new_record_' + utils.generateId()
        viewClass: NewRecordTabPanelView


export NewRecordTabPanelView = TabPanelView.extend
    validator: null

    template: recordTabTemplate

    ui:
        saveBtn: 'button[data-spec="save"]'
        cancelBtn: 'button[data-spec="cancel"]'
        modeSelect: 'select[name="mode"]'
        createdDateInput: 'input[name="created_date"]'
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
                expense: {required: true}
            messages:
                createdDate: tr("Please enter a valid date/time")
                expense: tr("Please enter a valid expense value")

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

    saveForm: ->
        if not @validator.form()
            return
        formData = @getUI('form').serializeForm()
        formData.tags = utils.splitToNonEmpty(formData.tags)
        console.debug('Saving record: ', formData)
        rec = minicash.collections.records.create(formData)
