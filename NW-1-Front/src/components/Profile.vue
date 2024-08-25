<script setup>
import { useLoginStore } from '../stores/loginStore.js';
const loginStore = useLoginStore();
</script>

<template>
    <div
        class="flex items-center p-2 pr-3 gap-2 absolute top-3 right-2 bg-blue-100 border-4 border-blue-400 rounded-lg shadow-lg">
        <img class="w-14 h-14 rounded-full border-2 border-blue-300" src="/favicon.png" alt="profile">
        <div class="font-medium dark:text-white">
            <span class="itbkk-fullname text-blue-600">{{ loginStore.getName() }}</span>
            <div class="text-sm text-gray-500 dark:text-gray-400">"Welcome to SIT"</div>
        </div>
    </div>
</template>

<style scoped></style>