<template>
  <router-link to="/campaigns" class="splash-wrapper d-block text-center text-decoration-none">
    <div class="position-relative splash-container">
      <h1 class="splash-heading text-light">
        5 x From x <span class="text-danger">Companion</span>
      </h1>
      <img src="../assets/splash.png" alt="Splash Image" class="img-fluid splash-image" />
    </div>
  </router-link>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.splash-wrapper {
  cursor: pointer;
}

.splash-container {
  position: relative;
}

.splash-heading {
  position: absolute;
  top: 10%;
  left: 0;
  width: 100%;
  font-size: 3rem;
  font-weight: bold;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.75);
  z-index: 2;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }

  @media (max-width: 388px) {
    display: none;
  }
}

.splash-image {
  width: 100%;
  height: auto;
  display: block;
}
</style>
