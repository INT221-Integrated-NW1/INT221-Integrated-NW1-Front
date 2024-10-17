<script setup>
import { onMounted, ref, watchEffect } from "vue";
import Notification from "../components/Notification.vue";
import AddBoard from "../components/AddBoard.vue"
import Profile from "../components/Profile.vue";
import { getItems } from "../libs/fetchUtils.js"
import { useRouter, useRoute } from "vue-router";
import { useNotiStore } from '../stores/notificationStore.js';
import { useLoginStore } from '../stores/loginStore.js';
import { useBoardStore } from '../stores/boardStore.js';
import 'animate.css';

const route = useRoute();
const router = useRouter()
const boardStore = useBoardStore();
const boards = boardStore.getBoards();
const notiStore = useNotiStore();
const loginStore = useLoginStore();

const getAllBoards = async () => {
    try {
        const userId = loginStore.getUserId();
        const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v3/boards`, loginStore.getToken());
        boards.value = data.filter(board => board.user.oid === userId);
        // boards.value = data;
        if (boards.value.length > 0) {
            router.push({ name: "TaskBoard", params: { id: boards.value[0].id } });
        }
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
};

onMounted(() => {
    getAllBoards();
});

const showModal = ref(false);
const openModal = () => {
    showModal.value = true;
    router.push({ name: 'AddBoard' });
};

const closeModal = () => {
    showModal.value = false;
    router.push({ name: 'Board' });
};

// ตรวจจับการเปลี่ยนเส้นทางและจัดการ modal
watchEffect(() => {
    if (route.name === 'AddBoard') {
        showModal.value = true;
    } else {
        showModal.value = false;
    }
});
</script>

<template>
    <header class="pt-8 flex justify-center">
        <h1
            class="mb-4 text-4xl text-center font-extrabold leading-none tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
            Board List</h1>
    </header>
    <Profile />
    <div>
        <!-- Empty Table -->
        <div v-if="boards?.length === 0" class="pt-4">
            <div class="flex justify-center w-auto">
                <Notification :message="notiStore.notificationMessage" v-if="notiStore.showNotification" />
            </div>
            <div class="flex justify-center">
                <div class="max-h-screen flex justify-center">
                    <div class="w-full max-w-screen-lg pl-2">
                        <div class="flex justify-between pb-2 gap-4">
                            <button @click="openModal"
                                class="itbkk-button-create bg-[#4d8cfa] px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-150 text-white hover:bg-[#0062ff] hover:text-[#f0f0f0]">
                                Create Board</button>
                            <AddBoard v-if="showModal" @close="closeModal" />
                        </div>
                        <div
                            class="relative max-h-[26.5em] bg-[rgba(0,0,0,0.5)] overflow-x-auto hide shadow-md sm:rounded-lg">
                            <table class="w-full text-sm text-left rtl:text-right table-fixed">
                                <thead class="text-lg uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                    <tr class="text-black">
                                        <th class="px-6 py-3 w-[10%] text-center">No</th>
                                        <th class="px-6 py-3 pl-48 w-[50%] text-center">Name</th>
                                        <th class="px-6 py-3 w-1/4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="font-semibold">
                                    <tr
                                        class="itbkk-item text-[1.2em] odd:bg-white odd:dark:bg-gray-900 even:bg-slate-100 even:dark:bg-gray-800">
                                        <td class="itbkk-assignees text-center py-6 px-4 bg-gradient-to-r from-pink-200 via-pink-400 to-rose-400 text-white shadow-md uppercase tracking-wide"
                                            colspan="3">
                                            No Board
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Table with Tasks -->
        <div v-else class="pt-4">
            <div class="flex justify-center w-auto">
                <Notification :message="notiStore.notificationMessage" v-if="notiStore.showNotification" />
            </div>
            <div class="flex justify-center">
                <div class="max-h-screen flex justify-center">
                    <div class="w-full max-w-screen-lg pl-2">
                        <div class="flex justify-between pb-2 gap-4">
                            <button @click="openModal"
                                class="itbkk-button-create bg-[#4d8cfa] px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-150 text-white hover:bg-[#0062ff] hover:text-[#f0f0f0]">
                                Create Board</button>
                            <AddBoard v-if="showModal" @close="closeModal" />
                        </div>
                        <div
                            class="relative max-h-[26.5em] bg-[rgba(0,0,0,0.5)] overflow-x-auto hide shadow-md sm:rounded-lg">
                            <table class="w-full text-sm text-left rtl:text-right table-fixed">
                                <thead class="text-lg uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                    <tr class="text-black">
                                        <th class="px-6 py-3 w-[10%] text-center">No</th>
                                        <th class="px-6 py-3 w-[50%] text-center">Name</th>
                                        <th class="px-6 py-3 w-1/4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="font-semibold">
                                    <tr v-for="(board, index) in boards" :key="index"
                                        class="itbkk-item text-[1.2em] text-black odd:bg-white odd:dark:bg-gray-900 even:bg-slate-100 even:dark:bg-gray-800 transition hover:translate-x-4 duration-300 ease-in-out">
                                        <td class="text-center">{{ index + 1 }}</td>
                                        <td @click="router.push({ name: 'TaskBoard', params: { id: board.id } })"
                                            class="text-center cursor-pointer">{{ board.name }}</td>
                                        <td class="text-center px-6 py-4">
                                            <button @click="router.push({ name: 'TaskBoard', params: { id: board.id } })"
                                                class="itbkk-button-delete px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-red-300 rounded-lg dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                                                View</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>