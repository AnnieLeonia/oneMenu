<template>
  <main>
    <p>Hello Edit</p>
    <p>{{ date }}</p>
    <button v-on:click="goBack()">BACK</button>
  </main>
</template>

<script>
export default {
  computed: {
    date: function() {
      return this.$route.params.date;
    }
  },
  methods: {
    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push("/");
    }
  }
};
</script>

<style lang="less">
</style>
