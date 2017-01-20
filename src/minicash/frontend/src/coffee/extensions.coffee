import Bb from 'backbone'
import Decimal from 'decimal.js'
import Hb from 'handlebars/runtime'

# Temporal stub for translation function
window.tr = (s) -> s


#--------- Handlebars -----------#

Hb.registerHelper 'ifnot', (v, options) ->
    return if not v
        options.fn(this)
    else
        options.inverse(this)


Hb.registerHelper 'context', (keys) ->
    val = window.minicash.CONTEXT

    for key in keys.split('.')
        val = val[key]
    val


Hb.registerHelper 'decimal', (options) ->
    val = new Decimal(options.fn(this))
    text = val.toString()
    return new Hb.SafeString(text);
#================================#


(($) -> $.fn.extend
    serializeForm: (options) ->
        defaults =
            forceArray: false

        o = $.extend(defaults, options);

        ret = []

        @each ->
            $obj = $(this);
            arrayData = $obj.serializeArray()
            formData = _.chain(arrayData)
                .indexBy('name')
                .mapObject((val, key) -> val.value)
                .value()
            ret.push(formData)

        if ret.length == 1 and not o.forceArray
            return ret[0]
        else
            return ret
)(jQuery)


#-------- CSRF ---------- #

getCookie = (name) ->
    cookieValue = null;
    if document.cookie and document.cookie != ''
        cookies = document.cookie.split(';')
        for i in [0..cookies.length]
            cookie = jQuery.trim(cookies[i])
            # Does this cookie string begin with the name we want?
            if cookie.substring(0, name.length + 1) == (name + '=')
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
                break
    return cookieValue


csrfToken = getCookie('csrftoken');

csrfSafeMethod = (method) ->
    # these HTTP methods do not require CSRF protection
    return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method)

$.ajaxSetup
    beforeSend: (xhr, settings) ->
        #===== CSRF =====#
        if not csrfSafeMethod(settings.type) and not @crossDomain
            xhr.setRequestHeader("X-CSRFToken", csrfToken)

        #===== Trailing slash =====#
        if not @crossDomain
            url = settings.url
            lastChar = url[-1..]
            if lastChar != '/'
               settings.url = url + '/'

#================================#

