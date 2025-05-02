<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <router-link to="/" class="navbar-brand d-flex align-items-center gap-2">
      <img src="./assets/logo.png" alt="Logo" class="logo-img" />
        <div class="d-flex flex-column lh-1">
          <span class="fw-bold fs-5">5 X from X</span>
          <span class="text-muted small">Companion</span>
        </div>
      </router-link>
      <router-link v-if="auth.route === 'authenticated'" to="/campaigns" class="navbar-brand d-flex align-items-center gap-2 mx-5">
        Campaigns
      </router-link>
      <div class="ms-auto">
        <authenticator style="display:none;" :social-providers="['google']"></authenticator>
        <template v-if="auth.route === 'authenticated'">
          <button @click="auth.signOut">Sign out</button>
        </template>
        <template v-if="auth.route !== 'authenticated'">
          <router-link to="/signin" class="navbar-brand d-flex align-items-center gap-2">
            Sign-In
          </router-link>
        </template>
      </div>
    </nav>

    <!-- Full-screen Content Area -->
    <main class="flex-fill w-100 px-2 py-2">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-vue';
const auth = useAuthenticator();
</script>

<style scoped lang="scss">
#app {
  margin: 0;
  padding: 0;
}

main {
  background-color: #1e1e1e;
  overflow-y: auto;
}

.logo-img {
  height: 70px; // let it "fill" vertically
  width: auto;
  margin-top: -.5rem;  // optional: float outside nav bar
  margin-bottom: -1rem;
}
</style>
