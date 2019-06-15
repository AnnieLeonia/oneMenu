<template>
  <div>
    <div class="info" v-if="info">
      <b>Varning!</b>
      {{info}}
    </div>
    <p>Var vänlig logga in för att använda OneMenu</p>
    <a href="/auth/google">Logga in</a>
  </div>
</template>

<script>
export default {
  computed: {
    isLoggedIn: function() {
      return !!this.$cookie.get("name");
    },
    info: function() {
      return this.$route.query.info;
    }
  }
};
</script>

<style lang="less">
.info {
  color: #a94442;
  background-color: #f2dede;
  padding: 15px;
}
</style>
