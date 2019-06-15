<template>
  <div>
    <div class="login-info" v-if="info">
      <b>Varning!</b>
      {{info}}
    </div>
    <p class="login-text">Var vänlig logga in för att använda OneMenu.</p>
    <button class="login-btn" v-on:click="login()">Logga in</button>
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
  },
  methods: {
    login() {
      location.href = "/auth/google";
    }
  }
};
</script>

<style lang="less">
.login-info {
  color: #a94442;
  background-color: #f2dede;
  padding: 15px;
}

.login-text {
  margin: 1em;
}

.login-btn {
  padding: 0.5em 1em;
  border-radius: 10px;
  color: inherit;
  text-decoration: none;
}
</style>
