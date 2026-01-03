<script setup lang="ts"></script>

<template>
  <router-view />
</template>

<style>
html {
  --font-sans: "Roboto", "Helvetica Neue", "Arial", sans-serif;
}

html.dyslexia-mode {
  --font-sans: "OpenDyslexic", "Atkinson Hyperlegible", "Verdana", "Arial", sans-serif;
  letter-spacing: 0.03em;
  word-spacing: 0.08em;
  line-height: 1.6;
}
</style>
