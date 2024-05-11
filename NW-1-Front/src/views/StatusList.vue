<script setup>
import { onBeforeMount, ref } from "vue";
import Notification from "../components/Notification.vue";
import { getItems, deleteItemById } from "../libs/fetchUtils.js"
import { addItem } from '../libs/fetchUtils.js';
import { useRouter, RouterView } from "vue-router";
import { useStatusStore } from '../stores/statusStore.js';
import { useNotiStore } from '../stores/notificationStore.js';
import 'animate.css';

const statusStore = useStatusStore();
const statuses = statusStore.getStatuses();
const notiStore = useNotiStore();

const addStatus = ref({ id: "", name: "", description: "" })

const router = useRouter()

const getAllStatus = async () => {
    try {
        const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v2/status`);
        statuses.value = data;
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
};

const saveStatus = async () => {
    try {
        // if (addStatus.value.name.trim() === "") {
        //     // ตั้งค่าเริ่มต้นหากสถานะว่าง
        //     addStatus.value.name = "NO_STATUS";
        // }
        if (addStatus.value.title === "") {
            notiStore.setNotificationMessage("Title cannot be empty");
            notiStore.setShowNotification(true);
            notiStore.setNotificationType("error");
            return; // Stop further execution
        }
        statusStore.addStatus();
        const newStatus = await addItem(`${import.meta.env.VITE_BASE_URL}/v2/status`, addStatus.value);
        statusStore.addStatus(newStatus);
        addStatus.value = { title: "", description: "" };
    } catch (error) {
        console.error('Error saving task:', error);
        notiStore.setNotificationMessage(`An error occurred deleting the task "${addStatus.value.title}`);
        notiStore.setShowNotification(true);
        notiStore.setNotificationType("error"); // Specify the type as 'error'
    }
};

const addModal = ref(false);
const openModal = () => {
    addModal.value = true;
};
const closeModal = () => {
    addModal.value = false;
};

const deleteConfirmModal = ref(false);
const statusToDelete = ref(null);

const openConfirmModal = (status) => {
    statusToDelete.value = status;
    deleteConfirmModal.value = true;
};

const closeConfirmModal = () => {
    statusToDelete.value = null;
    deleteConfirmModal.value = false;
};

const deleteStatus = async (id) => {
    try {
        const res = await deleteItemById(`${import.meta.env.VITE_BASE_URL}/v2/status`, id);
        // Check if the deletion was successful (HTTP status code 200 means success)
        if (res === 200) {
            // Create a new array that doesn't include the deleted task
            statuses.value = statuses.value.filter(status => status.id !== id);
            console.log(`Status with ID ${id} deleted successfully.`);
            // Show success notification
            notiStore.setNotificationMessage('Status deleted successfully');
            notiStore.setShowNotification(true);
            notiStore.setNotificationType("success");
            // Close confirm modal
            closeConfirmModal();
        } else if (res === 404) {
            console.error(`Failed to delete status with ID ${id}. Status does not exist.`);
            // Show error message
            notiStore.setNotificationMessage('An error has occurred, the status does not exist.');
            notiStore.setShowNotification(true);
            notiStore.setNotificationType("error");
            // Close confirm modal

            closeConfirmModal();
        } else {
            console.error(`Failed to delete status with ID ${id} HTTP status: ${res}`);
        }
    } catch (error) {
        console.error(`Failed to delete status with ID ${id}:`, error);
    }
};

onBeforeMount(() => {
    getAllStatus();
});
</script>
<template>
    <header class="pt-8 flex justify-center">
        <h1
            class="mb-4 text-4xl text-center font-extrabold leading-none tracking-tight text-[rgb(63,77,204)] sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
            IT-Bangmod<span class="text-gray-900 dark:text-white"> Kradan Kanban</span></h1>
    </header>
    <div class="max-h-screen dark:bg-gray-800 flex justify-center">
        <div class="w-full max-w-screen-lg p-8">
            <div class="flex pb-2 gap-2 justify-between">
                <div>
                    <RouterLink :to="{ name: 'TaskList' }">
                        <button
                            class="itbkk-button-home bg-slate-100 px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-200 text-black hover:bg-[#0062ff] hover:text-[#f0f0f0]">Home</button>
                    </RouterLink>
                </div>
                <div>
                    <RouterLink :to="{ name: 'StatusList' }">
                        <button @click="openModal"
                            class="itbkk-button-add bg-green-400 px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-200 text-white hover:bg-green-500 hover:text-[#f0f0f0] focus:ring-4 focus:outline-none focus:ring-green-300">Add
                            Status</button>
                    </RouterLink>
                </div>
            </div>
            <div class="relative h-[25.7em] bg-[rgba(0,0,0,0.5)] hide overflow-x-auto shadow-md sm:rounded-lg">
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
                            class="odd:bg-white odd:dark:bg-gray-900 even:bg-slate-100 even:dark:bg-gray-800 transition hover:translate-x-4 duration-300 ease-in-out">
                            <td class="px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">{{ index + 1 }}</td>
                            <td class="px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                <div class="flex items-center text-lg">
                                    <div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> {{ status.name }}
                                </div>
                            </td>
                            <td class="px-6 py-4 max-w-xs truncate text-gray-900 whitespace-nowrap dark:text-white">{{
                        status.description }}</td>
                            <td class="px-6 py-4">
                                <button type="button"
                                    class="itbkk-button-edit px-5 py-2.5 sm:mb-2 lg:mb-0 mr-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    Edit</button>
                                <button type="button" @click="openConfirmModal(status)"
                                    class="itbkk-button-delete px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 rounded-lg dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                                    Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Add modal -->
    <div v-if="addModal"
        class="itbkk-modal-status bg-gray-900 bg-opacity-70 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full inset-0 max-h-full">
        <div class="relative p-4 w-full max-w-xl max-h-full">
            <!-- Modal content -->
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Add Status
                    </h3>
                    <button @click="closeModal" type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        data-modal-toggle="crud-modal">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                    </button>
                </div>
                <!-- Modal body -->
                <form class="p-4 md:p-5">
                    <div class="grid gap-4 mb-4 grid-cols-2">
                        <div class="itbkk-status-name col-span-2">
                            <label for="name"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                            <input type="text" id="name" v-model="addStatus.name"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="Type status name" required="">
                        </div>
                        <!-- <div class="col-span-2 sm:col-span-1">
                            <label for="price"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price</label>
                            <input type="number" name="price" id="price"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="$2999" required="">
                        </div>
                        <div class="col-span-2 sm:col-span-1">
                            <label for="category"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                            <select id="category"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                <option selected="">Select category</option>
                                <option value="TV">TV/Monitors</option>
                                <option value="PC">PC</option>
                                <option value="GA">Gaming/Console</option>
                                <option value="PH">Phones</option>
                            </select>
                        </div> -->
                        <div class="itbkk-status-description col-span-2">
                            <label for="description"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Description</label>
                            <textarea id="description" rows="4" v-model="addStatus.description"
                                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 resize-none"
                                placeholder="Write status description here"></textarea>
                        </div>
                    </div>
                    <div @click="saveStatus"
                        class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        <svg class="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                clip-rule="evenodd"></path>
                        </svg>
                        Add new status
                    </div>
                </form>
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
                <!-- <p>"{{ taskToDelete.title }}" ?</p> -->
            </div>
            <div class="flex justify-center mt-4">
                <button
                    class="itbkk-button-confirm btn bg-green-600 hover:bg-green-500 border-0 mr-4 flex-grow hover:scale-105 duration-150 text-white"
                    @click="deleteStatus(statusToDelete.id)">Confirm</button>
                <button
                    class="itbkk-button-cancel btn bg-red-500 hover:bg-red-600 border-0 flex-grow hover:scale-105 duration-200 text-white"
                    @click="closeConfirmModal">Cancel</button>
            </div>
        </div>
    </div>

</template>

<style scoped></style>