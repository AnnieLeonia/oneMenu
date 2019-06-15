<template>
  <div>
    <div class="info" v-if="message">
      <b>Varning!</b>
      {{message}}
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
    message: function() {
      return this.$route.query.message;
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
