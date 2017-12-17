<template>
<div>
  <b-card no-body>
    <b-tabs card>
      <b-tab :title="`${title}`" v-for="tab in tabs" :key="tab.id">
        <component :is="tab.tabName"></component>
      </b-tab>

    </b-tabs>
  </b-card>

</div>
</template>

<script>
import Home from '~/components/tabs/home';

export default {
    components: {
        'home': Home,
    },

    created() {
        debugger;
    },

    props: {
        tabComponentIs: String
    },

    data () {
        return {
            tabs: [],
            tabCounter: 0
        }
    },

    methods: {
        addTab(tab) {

            this.tabs.push(tab);
        },

        closeTab (x) {
            for (let i = 0; i < this.tabs.length; i++) {
                if (this.tabs[i] === x) {
                    this.tabs.splice(i, 1)
                }
            }
        },
        newTab () {
            this.tabs.push(this.tabCounter++)
        }
    },

    beforeRouteUpdate (to, from, next) {
        debugger;
        // react to route changes...
        // don't forget to call next()
        next();
    }
}
</script>
