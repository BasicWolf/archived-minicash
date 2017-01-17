export UIMixin =
    uiEnable: (names) ->
        if not _.isArray(names)
            names = [names]

        for name in names
            @getUI(name).removeAttr('disable')

    uiDisable: (names) ->
        if not _.isArray(names)
            names = [names]

        for name in names
            @getUI(name).prop('disable', true)
