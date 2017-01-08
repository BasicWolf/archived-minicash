import Mn from 'backbone.marionette'

### --- CONSTANTS --- ###

export KEYS =
    ENTER: 13
    ESCAPE: 27


### --- NOTIFICATIONS --- ###

export notify = do ->
    _notify = (options={}, settings={}) ->
        $.notify(options, settings)

    notifySimple = (message, type='info') ->
        _notify({
            message: message
        }, {
            type: type
            allow_dismiss: true
        })

    _notify.info = (message) -> notifySimple(message, 'info')
    _notify.success = (message) -> notifySimple(message, 'success')
    _notify.warning = (message) -> notifySimple(message, 'warning')
    _notify.error = (message) -> notifySimple(message, 'danger')
    _notify

### ====================== ###



export UnwrappedView = Mn.View.extend
    onRender: ->
        # Get rid of that pesky wrapping-div.
        # Assumes 1 child element present in template.
        @$el = @$el.children()
        # Unwrap the element to prevent infinitely
        # nesting elements during re-render.
        @$el.unwrap()
        @setElement(@$el)


# generateId :: Integer -> String
export generateId = (len) ->
    dec2hex = (dec) -> dec.toString(16)
    arr = new Uint8Array((len || 40) / 2)
    window.crypto.getRandomValues(arr)
    Array.from(arr).map(dec2hex).join('')


export splitToNonEmpty = (s, splitter) ->
    s.split(splitter).filter((s) -> s)
