<template>
<div>
  <b-card no-body>
    <b-tabs card>
      <b-tab v-for="tab in tabbar.tabs"
             :title="tab.title"
             :key="tab.id">
        <component :is="tab.componentIs"></component>
      </b-tab>

    </b-tabs>
  </b-card>

</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Home from '~/components/tabs/home';
import {ADD_TAB} from '~/store/mutation-types';

export default {
    components: {
        'home': Home
    },

    props: {
        tabComponentIs: String
    },

    computed: {
        ...mapState([
            'tabbar'
        ])
    },

    methods: {
        closeTab (x) {
            for (let i = 0; i < this.tabs.length; i++) {
                if (this.tabs[i] === x) {
                    this.tabs.splice(i, 1)
                }
            }
        },

        ...mapActions([
            'addTab'
        ])
    },

    beforeRouteUpdate (to, from, next) {
        debugger;
        // react to route changes...
        // don't forget to call next()
        next();
    },

    created() {
        this.addTab({
            componentIs: this.tabComponentIs,
            title: 'Home',
        })
    },
}
</script>
