<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const username = ref('');
const password = ref('');
const errorMessage = ref('');

const isFormValid = () => {
    return username.value && password.value;
};

const login = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username.value,
                password: password.value,
            }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }
        const data = await response.json();
        console.log('Login successful:', data);
        // Handle successful login, e.g., save token, redirect to dashboard
        router.push({ name: 'Dashboard' });
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
                <div class="form-group">
                    <label class="" for="username">Username:</label>
                    <input type="text" id="text" v-model="text" placeholder="Enter your username" maxlength="50"
                        required />
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" v-model="password" placeholder="Enter your password"
                        maxlength="14" required />
                </div>
                <button class="itbkk-button-signin" type="submit">Sign in</button>
            </form>
            <p v-if="error" class="error-message">{{ error }}</p>
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