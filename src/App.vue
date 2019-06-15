<template>
  <div id="app">
    <Login v-if="!isLoggedIn"/>
    <router-view v-if="isLoggedIn"/>
  </div>
</template>

<script>
import Login from "./components/Login";
import Week from "./components/Week";

export default {
  name: "App",
  components: {
    Login,
    Week
  },
  computed: {
    isLoggedIn: function() {
      return this.$cookie.get("name");
    }
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
}
</style>
