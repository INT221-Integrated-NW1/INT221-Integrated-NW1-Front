<script setup>
import 'animate.css';
import { useNotiStore } from '../stores/notificationStore.js';
import { onMounted } from 'vue';
const notiStore = useNotiStore();

const props = defineProps({
    duration: {
        type: Number,
        default: 3000
    }
});

const closeNotification = () => {
    notiStore.setShowNotification(false);
};

onMounted(() => {
    // Automatically hide the notification after the specified duration
    setTimeout(() => {
        notiStore.setShowNotification(false);
    }, props.duration);
});
</script>

<template>
    <div v-if="notiStore.showNotification" :class="`text-white z-[20] animate-bounce rounded-lg shadow-lg m-2 p-2
                ${notiStore.notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'}`">
        <div class="notification flex items-center justify-between">
            <p class="flex-grow">{{ notiStore.notificationMessage }}</p>
            <button
                class="close-button text-lg font-bold p-2 rounded-md bg-white text-black hover:text-red-600 hover:bg-gray-100 transition-colors duration-200 ml-4"
                @click="closeNotification">&times;</button>
        </div>
    </div>
</template>


<style scoped>
</style>