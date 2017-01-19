import 'tagsinput'
import 'typeahead'
import Decimal from 'jsdecimal'
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
        if childView.model.id == models.ID_NOT_SAVED
            @removeChildView(childView)
        else
            @replaceView(childView, SubRecordView)

    onChildviewCancelNewSubrecord: (childView) ->
        if childView.model.id == models.ID_NOT_SAVED
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
        'click @ui.deleteBtn': 'onDeleteBtnClick'

    triggers:
        'click @ui.editBtn': 'edit:subrecord'

    onDeleteBtnClick: ->
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
    template: require('templates/tab_records/sub_record_unfiled_row.hbs')

    ui:
        totalSubRecordsDeltaTxt: 'span[data-spec="total-sub-records-delta"]'

    triggers:
        'click button[data-spec="add-sub-record"]': 'new:subrecord'

    modelEvents:
        'change:sub_records': 'onSubRecordsChange'

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
            (memo, subRecord) -> memo.add(Decimal(subRecord['delta'])),
            Decimal(0)
        )
        ret = val or Decimal(0)
        utils.decimalToString(ret)


RecordRowView = Mn.View.extend
    tagName: 'tbody'
    template: require('templates/tab_records/record_row.hbs')

    ui:
        toggleSubRecordsBtn: 'button[data-spec="toggle-sub-records"]'
        deleteBtn: 'button[data-spec="delete-record"]'
        subRecordRow: 'tr[data-spec="sub-record-row"]'

    events:
        'click @ui.toggleSubRecordsBtn': 'toggleSubRecord'
        'click @ui.deleteBtn': 'deleteRecord'

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

    deleteRecord: ->
        @model.destroy()


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
