<template>
  <div v-if="!isLoggedIn" class="login-background">
    <div class="login-modal">
      <div class="login-info" v-if="info">
        <b>Varning!</b>
        {{info}}
      </div>
      <p class="login-text">Var vänlig logga in för att använda OneMenu.</p>
      <button class="login-btn" v-on:click="login()">Logga in</button>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    info: function() {
      return this.$route.query.info;
    }
  },
  asyncComputed: {
    isLoggedIn: async function() {
      const res = await fetch("/auth/me");
      const user = await res.json();
      return !!user.id;
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
.login-background {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}
.login-modal {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}
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
