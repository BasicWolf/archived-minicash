<template>
<b-navbar toggleable="md" type="dark" variant="dark" fixed="top">
  <b-navbar-brand href="#">Minicash / 0a</b-navbar-brand>
  <div class="container">
    <b-collapse is-nav id="navbar_collapse">

      <b-nav-form>
        <b-button href="#" variant="success" size="sm">New record</b-button>
      </b-nav-form>

      <b-navbar-nav>

        <b-nav-item href="#">Link</b-nav-item>
        <b-nav-item href="#" disabled>Disabled</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </div>
</b-navbar>
</template>

<script>
export default {
    
};
</script>
