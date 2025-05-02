<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <!-- Brand -->
      <router-link to="/" class="navbar-brand d-flex align-items-center gap-2">
        <img src="./assets/logo.png" alt="Logo" class="logo-img" />
        <div class="d-flex flex-column lh-1 logo-text">
          <span class="fw-bold fs-5">5 x From x</span>
          <span class="text-danger small">Companion</span>
        </div>
      </router-link>

      <!-- Toggler -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Nav Content -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Left Nav -->
        <ul class="navbar-nav">
          <li class="nav-item" v-if="user">
            <router-link to="/campaigns" class="nav-link">Campaigns</router-link>
          </li>
          <li class="nav-item" v-else>
            <router-link to="/signin" class="nav-link">Sign-In</router-link>
          </li>
        </ul>

        <!-- Right Nav (Sign Out Button) -->
        <ul class="navbar-nav ms-auto">
          <li class="nav-item" v-if="user">
            <button @click="doSignOut()" class="btn btn-outline-light">Sign out</button>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Content Area -->
    <main class="flex-fill w-100 px-2 py-2">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { getCurrentUser, signOut } from '@aws-amplify/auth';
import { onMounted, ref } from 'vue';

const user = ref();

async function getUserAuth() {
  const { userId } = await getCurrentUser();
  user.value = userId;
}

async function doSignOut() {
  await signOut();
}

onMounted(() => {
  getUserAuth()
})
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

.logo-text,
.nav-item {
  font-family: 'Orbitron', sans-serif;
}
</style>
