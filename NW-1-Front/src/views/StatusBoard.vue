<script setup>
import { onBeforeMount, ref, watch } from "vue";
import Notification from "../components/Notification.vue";
import Profile from "../components/Profile.vue";
import { getItems, deleteItemById } from "../libs/fetchUtils.js"
import { useRouter, RouterView, useRoute } from "vue-router";
import { useTaskStore } from '../stores/taskStore.js';
import { useStatusStore } from '../stores/statusStore.js';
import { useNotiStore } from '../stores/notificationStore.js';
import { useLoginStore } from '../stores/loginStore.js';
import 'animate.css';

const taskStore = useTaskStore();
const tasks = taskStore.getTasks();
const notiStore = useNotiStore();
const statusStore = useStatusStore();
const statuses = statusStore.getStatuses();
const loginStore = useLoginStore();

const router = useRouter()
const route = useRoute();
const selectedStatuses = ref([]);

const getAllStatus = async (id) => {
    try {
        const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v3/boards/${id}/statuses`, loginStore.getToken());
        statuses.value = data;
        if (data.status === 401) {
            router.push({ name: "Login" })
        }
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
};

const checkBox = ref(false);
const openCheckbox = () => {
    checkBox.value = !checkBox.value;
};

const deleteConfirmModal = ref(false);
const taskToDelete = ref(null);

const openConfirmModal = (task) => {
    taskToDelete.value = task;
    deleteConfirmModal.value = true;
};

const closeConfirmModal = () => {
    taskToDelete.value = null;
    deleteConfirmModal.value = false;
};

onBeforeMount(() => {
    const id = route.params.id; // Get the task ID from the router parameters
    getAllStatus(id);
});
</script>

<template>
    <header class="pt-8 pb-8 flex justify-center">
        <h1
            class="mb-4 text-4xl text-center font-extrabold leading-none tracking-tight text-[rgb(63,77,204)] sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
            IT-Bangmod<span class="text-gray-900 dark:text-white"> Kradan Kanban</span></h1>
    </header>
    <Profile />
    <div class="flex justify-center w-auto">
        <Notification :message="notiStore.notificationMessage" v-if="notiStore.showNotification" />
    </div>
    <div class="max-h-screen dark:bg-gray-800 flex justify-center">
        <div class="w-full max-w-screen-lg px-8">
            <div class="flex pb-2 gap-2 justify-between">
                <div>
                    <RouterLink :to="{ name: 'TaskList' }">
                        <button
                            class="itbkk-button-home bg-slate-100 px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-200 text-black hover:bg-[#0062ff] hover:text-[#f0f0f0]">Home</button>
                    </RouterLink>
                </div>
                <div>
                    <button @click="router.push({ name: 'AddStatus' })"
                        class="itbkk-button-add bg-green-400 px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-200 text-white hover:bg-green-500 hover:text-[#f0f0f0] focus:ring-4 focus:outline-none focus:ring-green-300">Add
                        Status</button>
                </div>
            </div>
            <div class="relative max-h-[27em] bg-[rgba(0,0,0,0.5)] hide overflow-x-auto shadow-md sm:rounded-lg">
                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 table-fixed">
                    <thead
                        class="text-lg text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                        <tr>
                            <th class="px-6 py-3 w-1/12">Id</th>
                            <th class="px-6 py-3 w-1/6">Name</th>
                            <th class="px-6 py-3 w-[20%]">Description</th>
                            <th class="px-[68px] py-3 w-1/6">Action</th>
                        </tr>
                    </thead>
                    <tbody class="font-semibold">
                        <tr v-for="(status, index) in statuses" :key="index"
                            class="itbkk-item bg-white transition hover:translate-x-4 duration-300 ease-in-out text-[1.2em]">
                            <td class="px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">{{ index + 1 }}</td>
                            <td
                                class="itbkk-status-name px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white truncate">
                                {{ status.name }}</td>
                            <td
                                class="itbkk-status-description px-6 py-4 max-w-xs truncate text-gray-900 whitespace-nowrap dark:text-white">
                                <span v-if="!status.description" class="text-gray-400 italic">No description is
                                    provided.</span>
                                <span v-else>{{ status.description }}</span>
                            </td>
                            <td class="px-6 py-4" v-if="status.name !== 'Done'">
                                <button @click="editStatus(status)"
                                    class="itbkk-button-edit px-5 py-2.5 sm:mb-2 lg:mb-0 mr-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    Edit</button>
                                <button @click="checkStatusUsage(status.id)"
                                    class="itbkk-button-delete px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 rounded-lg dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                                    Delete</button>
                            </td>
                            <td class="px-6 py-4" v-else>
                                
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <!-- Delete Confirm Modal -->
    <div class="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-70 flex justify-center items-center text-white scale-125 z-50"
        v-if="deleteConfirmModal">
        <div class="bg-gray-800 p-4 rounded-lg w-96 border-[4px] border-[#37373D]">
            <h3 class="text-[#FFC745] font-bold text-lg ">Delete a Task</h3>
            <hr>
            <div class="text-center overflow-hidden">
                <p>Do you want to delete the task</p>
                <p>"{{ taskToDelete.title }}" ?</p>
            </div>
            <div class="flex justify-center mt-4">
                <button
                    class="itbkk-button-confirm btn bg-green-600 hover:bg-green-500 border-0 mr-4 flex-grow hover:scale-105 duration-150 text-white"
                    @click="deleteTask(taskToDelete.id)">Confirm</button>
                <button
                    class="itbkk-button-cancel btn bg-red-500 hover:bg-red-600 border-0 flex-grow hover:scale-105 duration-200 text-white"
                    @click="closeConfirmModal">Cancel</button>
            </div>
        </div>
    </div>
    <RouterView />
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lobster&display=swap');

.lobster-regular {
    font-family: "Lobster", sans-serif;
    font-weight: 200;
    font-style: normal;
}

.head-shadow {
    filter: drop-shadow(#FFC55A 3px 3px 0px)
}

.button-shadow {
    filter: drop-shadow(#2C4E80 3px 3px 0px)
}
</style>