<script setup>
import { onBeforeMount, ref } from "vue";
import Notification from "../components/Notification.vue";
import { getItems, deleteItemById } from "../libs/fetchUtils.js"
import { useRouter, RouterView } from "vue-router";
import { useTaskStore } from '../stores/taskStore.js';
import { useNotiStore } from '../stores/notificationStore.js';
import 'animate.css';

const taskStore = useTaskStore();
const tasks = taskStore.getTasks();
const notiStore = useNotiStore();

const router = useRouter()
const getAllTasks = async () => {
    try {
        const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v1/tasks`);
        tasks.value = data;
        console.log(data);
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
    }
};
const formatStatus = (status) => {
    switch (status) {
        case "NO_STATUS":
            return "No Status";
        case "TO_DO":
            return "To Do";
        case "DOING":
            return "Doing";
        case "DONE":
            return "Done";
        default:
            return status;
    }
};
onBeforeMount(() => {
    getAllTasks();
});

</script>
<template>
    <div class="min-h-screen dark:bg-gray-800 flex justify-center">
        <div class="w-full max-w-screen-lg p-8">
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 table-fixed">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" class="px-6 py-3 w-1/12">Id</th>
                            <th scope="col" class="px-6 py-3 w-1/6">Name</th>
                            <th scope="col" class="px-6 py-3 w-[20%]">Description</th>
                            <th scope="col" class="px-6 py-3 w-1/6">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Dynamically rendered rows from API -->
                        <tr v-for="(task, index) in tasks" :key="index"
                            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition hover:-translate-x-2 duration-300 ease-in-out">
                            <td class="px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">{{ index + 1 }}</td>
                            <td class="px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                <div class="flex items-center">
                                    <div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> {{ task.status }}
                                </div>
                            </td>
                            <td class="px-6 py-4 font-normal text-gray-500 max-w-xs truncate">{{ task.description }} LoveLove</td>
                            <td class="px-6 py-4">
                                <button type="button"
                                    class="px-5 py-2.5 mr-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    Edit</button>
                                <button type="button"
                                    class="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
