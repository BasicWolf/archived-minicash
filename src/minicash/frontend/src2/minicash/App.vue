<template>
  <div id="app">
    <Navbar></Navbar>
    <router-view></router-view>
  </div>
</template>

<script>
import Navbar from '~/components/page/navbar';
import Tabbar from '~/components/page/tabbar';

export default {
    name: 'App', // Application Name

    components: {
        Navbar,
        Tabbar,
    }
};
</script>

<style lang="scss" scoped>
#app {
  padding-top:53px;
}
</style>
