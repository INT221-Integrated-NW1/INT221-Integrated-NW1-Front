<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLoginStore } from '../stores/loginStore.js';

const router = useRouter();
const loginStore = useLoginStore();

const username = ref('');
const password = ref('');
const errorMessage = ref('');

const isFormValid = () => {
    return username.value && password.value;
};

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
            const token = await response.text();
            console.log('Login successful, received token:', token);
            // Save the token to localStorage or Vuex for later use
            loginStore.login(token, username.value);
            router.push({ name: 'TaskList' });
        } else {
            errorMessage.value = 'Invalid username or password';
        }
    } catch (error) {
        errorMessage.value = 'Invalid username or password';
        console.error('Error during login:', error);
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <form @submit.prevent="login">
                <div class="form-group itbkk-username">
                    <label for="username">Username:</label>
                    <input type="text" id="username" v-model="username" placeholder="Enter your username" maxlength="50"
                        required />
                </div>
                <div class="form-group itbkk-password">
                    <label for="password">Password:</label>
                    <input type="password" id="password" v-model="password" placeholder="Enter your password"
                        maxlength="14" required />
                </div>
                <button class="itbkk-button-signin" type="submit">Sign in</button>
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

.error-message {
    color: red;
    margin-top: 15px;
    text-align: center;
}
</style>