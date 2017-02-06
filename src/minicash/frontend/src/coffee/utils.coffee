import Bb from 'backbone'
import Bhound from 'bloodhound'
import Decimal from 'decimal.js'
import Mn from 'backbone.marionette'

### --- CONSTANTS --- ###

export KEYS =
    ENTER: 13
    ESCAPE: 27


### --- NOTIFICATIONS AND STATUS --- ###

export class Notify
    constructor: ->
        # make a class callable with default call being Class.info(...)
        shortcut = -> shortcut.info(arguments...)
        for key, value of @
            shortcut[key] = value
        return shortcut

    _invoke: (message, type='info') ->
        $.notify({
            message: message
        }, {
            type: type
            allow_dismiss: true
        })

    info: (message) -> @_invoke(message, 'info')
    success: (message) -> @_invoke(message, 'success')
    warning: (message) -> @_invoke(message, 'warning')
    error: (message) -> @_invoke(message, 'danger')


export class Status
    constructor: ->
        @$el = $('<div class="minicash-status" style="display:none;"><div></div></div>')
        $('body').append(@$el)

    show: ->
        @$el.show()

    hide: ->
        @$el.fadeOut(500)

### ====================== ###


### --- HELPER CLASSES --- ###


export UnwrappedView = Mn.View.extend
    onRender: ->
        # Get rid of that pesky wrapping-div.
        # Assumes 1 child element present in template.
        @$el = @$el.children()
        # Unwrap the element to prevent infinitely
        # nesting elements during re-render.
        @$el.unwrap()
        @setElement(@$el)


export class Bloodhound extends Bb.Events
    _.extend @prototype, Bb.Events

    _bloodhound: null

    constructor: (@collection, @attribute) ->
        @listenTo(@collection, 'update', @refreshBloodhound)
        @listenTo(@collection, 'reset', @refreshBloodhound)

    refreshBloodhound: ->
        @_bloodhound = new Bhound
            local: @collection.toJSON()
            datumTokenizer: Bhound.tokenizers.obj.whitespace(@attribute)
            queryTokenizer: Bhound.tokenizers.whitespace

        @_bloodhound.initialize()

    adapter: ->
        return @_bloodhound.ttAdapter()

### ====================== ###


### --- HELPER FUNCTIONS --- ###

# generateId :: Integer -> String
export generateId = (len) ->
    dec2hex = (dec) -> dec.toString(16)
    arr = new Uint8Array((len || 40) / 2)
    window.crypto.getRandomValues(arr)
    Array.from(arr).map(dec2hex).join('')


export splitToNonEmpty = (s, splitter) ->
    s.split(splitter).filter((s) -> s)


export decimalToString = (dec) ->
    dec.toFixed(3)


export compareStringsAsDecimals = (s1, s2) ->
    decimalToString(new Decimal(s1)) == decimalToString(new Decimal(s2))
