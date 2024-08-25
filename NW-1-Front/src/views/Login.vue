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
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username.value,
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
            const token = await response.text();
            const decodedToken = decodeJWT(token);
            console.log('Login successful, received token:', decodedToken);
            // Save the token to localStorage or Vuex for later use
            loginStore.login(decodedToken);
            router.push({ name: 'TaskList' });
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
        <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <form @submit.prevent="login">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" class="itbkk-username" v-model="username"
                        placeholder="Enter your username" maxlength="50" required />
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" class="itbkk-password" v-model="password"
                        placeholder="Enter your password" maxlength="14" required />
                </div>
                <button :class="{
                    'itbkk-button-signin': true,
                    'disabled:bg-gray-400 disabled:cursor-not-allowed disabled': !isFormValid,
                    'bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none': isFormValid
                }" type="submit" :disabled="!isFormValid">
                    Sign in
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1 {
    text-align: center;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
}

input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
}

button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}
</style>