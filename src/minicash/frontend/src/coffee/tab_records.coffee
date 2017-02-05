import 'tagsinput'
import 'typeahead'
import Decimal from 'decimal.js'
import Hb from 'handlebars/runtime'
import Mn from 'backbone.marionette'

import * as models from './models'
import * as utils from './utils'
import {TabPanelView, TabModel} from './tabbar'


export RecordsTab = TabModel.extend
    defaults: ->
        title: 'Records'
        name: 'records'
        viewClass: RecordsTabPanelView


SubRecordsTableView = Mn.View.extend
    template: require('templates/tab_records/sub_records_table.hbs')

    initialize: (model, options) ->
        @subRecords = new models.SubRecords(
            @model.get('sub_records'),
            modelDefaults: {'parent_record': @model.id}
        )
        @listenTo(@subRecords, 'update', @onSubRecordsChange)
        @listenTo(@subRecords, 'change', @onSubRecordsChange)

    onSubRecordsChange: ->
        @model.set('sub_records', @subRecords.toJSON())

    regions:
        body:
            el: 'tbody[data-spec="sub-records-table-body"]'
            replaceElement: true

        unfiledDataBody:
            el: 'tbody[data-spec="unfiled-data-body"]'

    onRender: ->
        @showChildView('body', new SubRecordsTableBodyView({
            collection: @subRecords
        }))

        @showChildView('unfiledDataBody', new SubRecordUnfiledView({
            model: @model
        }))

    onChildviewNewSubrecord: (childView) ->
        bodyView =  @getChildView('body');
        bodyView.startNewSubRecord()


SubRecordsTableBodyView = Mn.CollectionView.extend
    tagName: 'tbody'
    childView: -> SubRecordView

    startNewSubRecord: ->
        @addChildView(new SubRecordNewView(collection: @collection))

    onChildviewSaveNewSubrecord: (childView) ->
        if not childView.model?
            @removeChildView(childView)
        else
            @replaceView(childView, SubRecordView)

    onChildviewCancelNewSubrecord: (childView) ->
        if not childView.model?
            @removeChildView(childView)
        else
            @replaceView(childView, SubRecordView)

    replaceView: (oldView, NewViewClass) ->
        model = oldView.model
        index = oldView._index

        @removeChildView(oldView)

        newView = new NewViewClass
            model: model
            collection: @collection
        @addChildView(newView, index)

    onChildviewEditSubrecord: (childView) ->
        @replaceView(childView, SubRecordNewView)


SubRecordView = Mn.View.extend
    tagName: 'tr'
    template: require('templates/tab_records/sub_record_row.hbs')

    ui:
        deleteBtn: 'button[data-spec="delete-sub-record"]'
        editBtn: 'button[data-spec="edit-sub-record"]'

    events:
        'click @ui.deleteBtn': 'deleteSubRecord'

    triggers:
        'click @ui.editBtn': 'edit:subrecord'

    deleteSubRecord: ->
        @model.destroy()


SubRecordNewView = Mn.View.extend
    tagName: 'tr'
    template: require('templates/tab_records/sub_record_new_row.hbs')

    validator: null

    ui:
        deltaInput: 'input[name="delta"]'
        tagsInput: 'input[name="tags"]'
        descriptionInput: 'input[name="description"]'
        saveBtn: 'button[data-spec="save-new-sub-record"]'
        cancelBtn: 'button[data-spec="cancel-new-sub-record"]'
        form: 'form'

    events:
        'keydown @ui.deltaInput,@ui.descriptionInput': 'onInputKeyDown'
        'click @ui.saveBtn': 'save'
        'click @ui.cancelBtn': 'cancel'

    collectionEvents:
        'sync': -> @triggerMethod('save:new:subrecord', @)

    onRender: ->
        @initializeValidator()
        @initializeTagsInput()

    initializeValidator: ->
        @validator = @getUI('form').validate
            rules:
                delta: {required: true}

    initializeTagsInput: ->
        @getUI('tagsInput').tagsinput
            tagClass: 'label label-primary'
            typeaheadjs:
                displayKey: 'name',
                valueKey: 'name'
                source: minicash.collections.tags.bloodhound.adapter()

    onAttach: ->
        @getUI('deltaInput').focus()

    save: ->
        if not @validator.form()
            return

        formData = @getUI('form').serializeForm()
        formData.tags = @getUI('tagsInput').tagsinput('items')
        _.extend(formData, @collection.modelDefaults)

        if @model?
            @model.save(formData, wait: true)
        else
            @collection.create(formData, wait: true)

    cancel: ->
        @triggerMethod('cancel:new:subrecord', @)

    onInputKeyDown: (e) ->
        switch e.keyCode
            when utils.KEYS.ENTER then @save()
            when utils.KEYS.ESCAPE then @cancel()


SubRecordUnfiledView = Mn.View.extend
    tagName: 'tr'
    template: require('templates/tab_records/sub_record_unfiled_row.hbs')

    ui:
        totalSubRecordsDeltaTxt: 'span[data-spec="total-sub-records-delta"]'
        editBtn: 'button[data-spec="edit-record"]'
        deleteBtn: 'button[data-spec="delete-record"]'

    events:
        'click @ui.editBtn': 'editRecord'
        'click @ui.deleteBtn': 'deleteRecord'

    triggers:
        'click button[data-spec="add-sub-record"]': 'new:subrecord'

    modelEvents:
        'change:sub_records': 'onSubRecordsChange'
        'change:delta': 'render'
        'change:description': 'render'

    initialize: ->
        totalSubRecordsDelta = @getTotalSubRecordsDelta(@model.get('sub_records'))
        @model.set('view_total_sub_records_delta', totalSubRecordsDelta)

    onSubRecordsChange: (model, value, options) ->
        totalSubRecordsDelta = @getTotalSubRecordsDelta(model.get('sub_records'))
        model.set('view_total_sub_records_delta', totalSubRecordsDelta)
        @getUI('totalSubRecordsDeltaTxt').text(totalSubRecordsDelta)

    getTotalSubRecordsDelta: (subRecords) ->
        val = _.reduce(
            subRecords
            (memo, subRecord) -> memo.add(new Decimal(subRecord['delta'])),
            new Decimal(0)
        )
        val or new Decimal(0)

    editRecord: ->
        @triggerMethod('opentab', 'newRecord', {record: @model})

    deleteRecord: ->
        @model.destroy()


RecordDataView = Mn.View.extend
    tagName: 'tr'
    template: require('templates/tab_records/record_row_data.hbs')

    _subRecordsOpen: false

    ui:
        toggleSubRecordsBtn: 'button[data-spec="toggle-sub-records"]'

    events:
        'click @ui.toggleSubRecordsBtn': 'toggleSubRecord'

    modelEvents:
        'sync': 'render'

    toggleSubRecord: ->
        toggleSubRecordsBtnIcon = @getUI('toggleSubRecordsBtn').children('span')

        @_subRecordsOpen = not @_subRecordsOpen
        toggleSubRecordsBtnIcon.toggleClass('glyphicon-plus', not @_subRecordsOpen)
        toggleSubRecordsBtnIcon.toggleClass('glyphicon-minus', @_subRecordsOpen)

        @triggerMethod('toggleSubRecord', @_subRecordsOpen)


RecordRowView = Mn.View.extend
    tagName: 'tbody'
    template: require('templates/tab_records/record_row.hbs')

    ui:
        subRecordRow: 'tr[data-spec="sub-record-row"]'

    regions:
        subRecordRegion: {el: '[data-spec="sub-record-region"]'}
        recordDataRegion:
            el: '[data-spec="record-data-region"]'
            replaceElement: true

    onRender: ->
        @showChildView('recordDataRegion', new RecordDataView(model: @model))

    onChildviewToggleSubRecord: (show) ->
        if show
            @showChildView('subRecordRegion', new SubRecordsTableView(model: @model))
        else
            @getRegion('subRecordRegion').empty()

        @getUI('subRecordRow').toggleClass('hidden', not show)


RecordsTableView = Mn.CollectionView.extend
    tagName: 'table'

    className: 'table table-striped table-bordered'

    attributes:
        "data-spec": "records-table"
        "cellspacing": "0"
        "width": "100%"

    childView: RecordRowView

    onRender: ->
        template = require('templates/tab_records/records_table_head.hbs')
        $tableHead = $(template())
        @$el.prepend($tableHead)



RecordsTabPanelView = TabPanelView.extend
    template: require('templates/tab_records/tab_records.hbs')

    ui:
        newRecordBtn: 'button[data-spec="new-record"]'

    regions:
        recordsTableRegion: {el: '[data-spec="records-table-region"]'}

    events:
        'click @ui.newRecordBtn': 'startNewRecord'

    onRender: ->
        @showChildView('recordsTableRegion', new RecordsTableView(collection: minicash.collections.records))

    startNewRecord: ->
        minicash.tabbarManager.openTab('newRecord', source: @model)

    onChildviewChildviewChildviewOpentab: (tabtype, options) ->
        options = _.extend({
            source: @model
        }, options)
        minicash.tabbarManager.openTab('newRecord', options)


# ------ Handlebar helpers ------ #

Hb.registerHelper 'record_account', (assetFrom, assetTo, options) ->
    empty = ''
    assetFrom = minicash.collections.assets.get(assetFrom)
    assetTo = minicash.collections.assets.get(assetTo)

    assetFromName = if assetFrom? then assetFrom.get('name') else empty
    assetToName = if assetTo? then assetTo.get('name') else empty

    return "#{assetFromName} → #{assetToName}".trim()


Hb.registerHelper 'record_mode_sign', (mode, options) ->
    return switch mode
        when minicash.CONTEXT.RECORD_MODES.EXPENSE.value then '-'
        when minicash.CONTEXT.RECORD_MODES.INCOME.value then '+'
        when minicash.CONTEXT.RECORD_MODES.TRANSFER.value then ''
        else 'ERROR'

#=================================#
