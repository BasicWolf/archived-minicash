import Mn from 'backbone.marionette';

export let RecordsFilter = Mn.Behavior.extend({
    ui: {
        dtFrom: 'input[name="filter_dt_from"]',
        dtTo: 'input[name="filter_dt_from"]',
        tags: 'input[name="filter_tags"]',
    },

    events: {
        'change @ui.dtFrom': 'onFilterChange',
    },

    onRender: function() {
        let options = {
            showTodayButton: true,
            allowInputToggle: true,
            format: minicash.CONTEXT.user.dtFormat.split(' ')[0]
        };

        let $dtFrom = this.getUI('dtFrom');
        $dtFrom.parent().datetimepicker(options);

        let $dtTo = this.getUI('dtTo');
        $dtTo.parent().datetimepicker(options);
    },

    onFilterChange: function() {
        
    }
});
