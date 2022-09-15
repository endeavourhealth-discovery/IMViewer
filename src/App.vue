<template>
  <div class="layout-wrapper layout-static">
    <Toast />
    <div v-if="loading" class="flex flex-row justify-contents-center align-items-center loading-container">
      <ProgressSpinner />
    </div>
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref, provide } from "vue";
import ProgressSpinner from "primevue/progressspinner";
import { useStore } from "vuex";
import axios from "axios";

const store = useStore();

provide("axios", axios);

let loading = ref(true);

onMounted(() => {
  loading.value = true;
  store.dispatch("authenticateCurrentUser");
  loading.value = false;
});
</script>

<style>
body {
  overflow: hidden;
}

.loading-container {
  width: 100vw;
  height: 100vh;
}

.p-toast-message-text {
  width: calc(100% - 4rem);
}

.p-toast-message-content {
  width: 100%;
}

.p-toast-detail {
  width: 100%;
  word-wrap: break-word;
}
</style>
