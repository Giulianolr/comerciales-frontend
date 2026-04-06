<template>
  <div id="app" class="min-h-screen bg-canvas text-primary">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  @apply antialiased;
}

body {
  @apply bg-canvas text-primary font-sans;
}
</style>
