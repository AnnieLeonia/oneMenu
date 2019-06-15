<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import Week from "./components/Week";

export default {
  name: "App",
  components: {
    Week
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

h1 {
  display: inline-block;
  font-family: "AnticDidone", Helvetica, Arial, sans-serif;
  margin: 0.25em 0.5em;
  font-size: 160%;
  font-family: Antic Didone, serif;
}

@font-face {
  font-family: "AnticDidone";
  src: url("./assets/AnticDidone-Regular.ttf");
}
</style>
