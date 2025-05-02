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
      <div class="ms-auto">
        <button
          v-if="authStatus === 'authenticated'"
          class="btn btn-outline-light"
          @click="signOut"
        >
          Sign Out
        </button>
        <router-link
          v-else
          to="/signin"
          class="btn btn-outline-light"
        >
          Sign In
        </router-link>
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
import { useAuthenticator } from '@aws-amplify/ui-vue'
const { authStatus, signOut } = useAuthenticator()
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
