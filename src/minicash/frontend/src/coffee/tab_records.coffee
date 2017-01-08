import Mn from 'backbone.marionette'

import * as models from './models'
import {TabPanelView, TabModel} from './tabbar'
import * as utils from './utils'

import 'bootstrap-tokenfield'

recordsTabTemplate = require('templates/tab_records/tab_records.hbs')
recordRowTemplate = require('templates/tab_records/record_row.hbs')
recordsTableHeadTemplate = require('templates/tab_records/records_table_head.hbs')
subRecordsTableTemplate = require('templates/tab_records/sub_records_table.hbs')
subRecordRowTemplate = require('templates/tab_records/sub_record_row.hbs')
subRecordNewRowTemplate = require('templates/tab_records/sub_record_new_row.hbs')
subRecordUnfiledRowTemplate = require('templates/tab_records/sub_record_unfiled_row.hbs')


export RecordsTab = TabModel.extend
    defaults: ->
        title: 'Records'
        name: 'records'
        viewClass: RecordsTabPanelView


SubRecordsTableView = Mn.View.extend
    template: subRecordsTableTemplate

    initialize: (model, options) ->
        @subRecords = new models.SubRecords(
            @model.get('sub_records'),
            modelDefaults: {'parent_record': @model.id}
        )
        @listenTo(@subRecords, 'update', @onSubRecordsUpdate)

    onSubRecordsUpdate: ->
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
        @removeChildView(childView)

    onChildviewCancelNewSubrecord: (childView) ->
        @removeChildView(childView)


SubRecordView = Mn.View.extend
    tagName: 'tr'
    template: subRecordRowTemplate

    ui:
        deleteBtn: 'button[data-spec="delete-sub-record"]'

    events:
        'click @ui.deleteBtn': 'onDeleteBtnClick'

    onDeleteBtnClick: ->
        @model.destroy()


SubRecordNewView = Mn.View.extend
    tagName: 'tr'
    template: subRecordNewRowTemplate

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
        tagsInput = @getUI('tagsInput')
        tagsInput.tokenfield()

    onAttach: ->
        @getUI('deltaInput').focus()

    onSaveBtnClick: ->
        @save()

    save: ->
        if not @validator.form()
            return

        formData = @getUI('form').serializeForm()
        formData.tags = utils.splitToNonEmpty(formData.tags)
        _.extend(formData, @collection.modelDefaults)
        @collection.create(formData, wait: true)

    cancel: ->
        @triggerMethod('cancel:new:subrecord', @)

    onInputKeyDown: (e) ->
        switch e.keyCode
            when utils.KEYS.ENTER then @save()
            when utils.KEYS.ESCAPE then @cancel()


SubRecordUnfiledView = Mn.View.extend
    tagName: 'tr'
    template: subRecordUnfiledRowTemplate

    triggers:
        'click button[data-spec="add-sub-record"]': 'new:subrecord'


RecordRowView = Mn.View.extend
    tagName: 'tbody'
    template: recordRowTemplate

    ui:
        toggleSubRecordsBtn: 'button[data-spec="toggle-sub-records"]'
        subRecordRow: 'tr[data-spec="sub-record-row"]'

    events:
        'click @ui.toggleSubRecordsBtn': 'toggleSubRecord'

    regions:
        subRecordRegion: {el: '[data-spec="sub-record-region"]'}

    toggleSubRecord: ->
        subRecordRegion = @getRegion('subRecordRegion')
        subRecordRow = @getUI('subRecordRow')
        toggleSubRecordsBtnIcon = @getUI('toggleSubRecordsBtn').children('span')

        visible = subRecordRegion.hasView()

        if not visible
            subRecordRegion.show(new SubRecordsTableView(model: @model))
        else
            subRecordRegion.empty()

        subRecordRow.toggleClass('hidden', visible)
        toggleSubRecordsBtnIcon.toggleClass('glyphicon-plus', visible)
        toggleSubRecordsBtnIcon.toggleClass('glyphicon-minus', not visible)


RecordsTableView = Mn.CollectionView.extend
    tagName: 'table'

    className: 'table table-striped table-bordered'

    attributes:
        "data-spec": "records-table"
        "cellspacing": "0"
        "width": "100%"

    childView: RecordRowView

    onRender: ->
        $tableHead = $(recordsTableHeadTemplate())
        @$el.prepend($tableHead)


RecordsTabPanelView = TabPanelView.extend
    template: recordsTabTemplate

    ui:
        newRecordBtn: 'button[data-spec="new-record"]'

    regions:
        recordsTableRegion: {el: '[data-spec="records-table-region"]'}

    events:
        'click @ui.newRecordBtn': 'onNewRecordBtnClick'

    initialize: ->
        @initializeEvents()

    initializeEvents: ->
        @listenTo(minicash.collections.records, 'add', @onRecordAdded)

    onRender: ->
        @showChildView('recordsTableRegion', new RecordsTableView(collection: minicash.collections.records))

    onNewRecordBtnClick: ->
        minicash.tabbarManager.openTab('newRecord', source: @model)

    onRecordAdded: (model, collection, options) ->
        # data =
        #     asset_to:"1"
        #     asset_from:"1"
        #     created_date:"23/12/2016 16:38"
        #     delta:"100"
        #     description:""
        #     tags:"tags"
        # @$table.row.add(data)
        # @$table.draw()

#v         data = model.attributes
#        $table.rows.add(data)
#        $table.draw()
#        console.log('Added')
