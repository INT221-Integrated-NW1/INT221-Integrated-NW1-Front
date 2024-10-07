<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useLoginStore } from '../stores/loginStore.js';
import { useNotiStore } from '../stores/notificationStore.js';
import Notification from "../components/Notification.vue";

const router = useRouter();
const loginStore = useLoginStore();
const notiStore = useNotiStore();

const username = ref('');
const password = ref('');

const login = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName: username.value,
                password: password.value,
            }),
        });
        if (response.status === 200) {
            const decodeJWT = (token) => {
                // JWT consists of three parts separated by dots
                const base64Url = token.split('.')[1];
                // Replace characters to make it Base64 readable
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                // Decode Base64 string to JSON string
                const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                // Parse JSON string to an object
                return JSON.parse(jsonPayload);
            }
            // const token = await response.text();
            const token = await response.json()
            loginStore.setToken(token.access_token)
            const decodedToken = decodeJWT(token.access_token);
            // console.log('Login successful, received token:', decodedToken);
            // Save the token to localStorage or Vuex for later use
            loginStore.login(decodedToken);
            router.push({ name: 'Board' });
        } else {
            console.error = 'Invalid username or password';
            notiStore.setNotificationMessage("Username or Password is incorrect");
            notiStore.setShowNotification(true);
            notiStore.setNotificationType("error");
        }
    } catch (error) {
        console.error('Invalid username or password');
    }
};

const isFormValid = computed(() => {
    return username.value !== '' && password.value !== '';
});
</script>

<template>
    <div class="min-h-screen flex items-center justify-center">
        <div class="min-w-[300px] absolute top-0 right-0 p-4 mt-5">
            <Notification class="itbkk-message" :message="notiStore.notificationMessage"
                v-if="notiStore.showNotification" />
        </div>
        <div class="bg-gradient-to-tr from-indigo-700 from- to-sky-300 p-10 rounded-xl shadow-2xl w-full max-w-md">
            <form @submit.prevent="login" class="text-white font-bold space-y-6">
                <div class="form-group space-y-2">
                    <label for="username" class="block text-lg">Username :</label>
                    <input type="text" id="username"
                        class="itbkk-username w-full bg-white text-black p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        v-model="username" placeholder="Enter your username" maxlength="50" required />
                </div>
                <div class="form-group space-y-2">
                    <label for="password" class="block text-lg">Password :</label>
                    <input type="password" id="password"
                        class="itbkk-password w-full bg-white text-black p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        v-model="password" placeholder="Enter your password" maxlength="14" required />
                </div>
                <button :class="{
                    'w-full py-3 rounded-lg shadow-lg transform transition duration-300 ease-in-out': true,
                    'itbkk-button-signin': true,
                    'disabled:bg-gray-400 disabled:cursor-not-allowed disabled': !isFormValid,
                    'bg-black text-white font-semibold hover:bg-black hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500': isFormValid
                }" type="submit" :disabled="!isFormValid">
                    Sign in
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
</style>