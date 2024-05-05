<script setup>
import { useNotiStore } from '../stores/notificationStore.js';
import { onMounted, defineProps } from 'vue';
const notiStore = useNotiStore();

const props = defineProps({
    duration: {
        type: Number,
        default: 5000 // Default duration of 3 seconds
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
    <div v-if="notiStore.showNotification" class="notification-container fixed top-20 left-[8rem] z-50 mt-2 animate-bounce delay-300">
        <div class="notification">
            <p>{{ notiStore.notificationMessage }}</p>
            <button class="close-button" @click="closeNotification">&times;</button>
        </div>
    </div>
</template>

<style scoped>
.notification-container {
    display: flex;
    justify-content: flex-end;
    padding: 0.5rem;
}

.notification {
    background-color: #4CAF50;
    /* Success color */
    padding: 1rem;
    border-radius: 0.5rem;
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 300px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.close-button {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    margin-left: 1rem;
}

.close-button:hover {
    color: #d32f2f;
    /* Red color on hover for close button */
}

@media (max-width: 768px) {
    .notification-container {
        top: 2rem;
        right: 2rem;
    }
}
</style>