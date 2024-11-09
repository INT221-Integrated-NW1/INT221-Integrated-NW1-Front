<script setup>
import { ref } from 'vue';
import { useLoginStore } from '../stores/loginStore.js';

const loginStore = useLoginStore();
const isMenuOpen = ref(false)
const clickMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
}
</script>

<template>
  <nav class="p-2 flex items-center w-full max-h-[4em] fixed bg-transparent">
    <div class="flex-1">
      <router-link :to="{name: 'Board'}" >
        <button class="flex justify-center items-center btn btn-ghost text-xl">
          <img src="/images/home.png" alt="Home">
          <p class="text-black">ITB-KK</p>
        </button>
      </router-link>
    </div>
    <div class="relative">
      <button @click="clickMenu"
        class="px-2 min-w-[9em] flex items-center justify-center gap-2 bg-rose-400 hover:bg-rose-500 rounded-lg text-xl font-semibold transition duration-200 ease-in-out">
        <div class="w-12 rounded-full">
          <img src="/images/favicon.png" alt="profile">
        </div>
        <p class="itbkk-fullname text-white">{{ loginStore.getName() }}</p>
      </button>
      <div v-if="isMenuOpen"
        class="absolute right-0 mt-1 w-auto bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-[1]">
        <button @click="loginStore.logout"
          class="text-black hover:text-red-500 hover:bg-slate-100 px-4 py-1 rounded-md transition duration-200">Logout</button>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>