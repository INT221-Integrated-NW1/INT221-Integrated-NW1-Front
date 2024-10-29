<script setup>
</script>

<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="max-w-lg text-center bg-white shadow-lg rounded-lg p-8">
            <h1 class="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p class="text-gray-700 mb-6">
                You need to be the board owner to perform this action.
            </p>
            <router-link to="/login"
                class="inline-block px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition">
                 Login
            </router-link>
        </div>
    </div>
</template>

<style scoped></style>
