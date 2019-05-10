<template>
  <div id="app">
    <Week />
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
</style>
