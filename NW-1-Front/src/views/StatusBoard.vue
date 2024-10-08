<script setup>
import { onBeforeMount, computed, ref } from "vue";
import Notification from "../components/Notification.vue";
import Profile from "../components/Profile.vue";
import { getItems, deleteItemById, deleteTransfer, deleteItem } from "../libs/fetchUtils.js"
import { useRouter, RouterView, useRoute } from "vue-router";
import { useStatusStore } from '../stores/statusStore.js';
import { useNotiStore } from '../stores/notificationStore.js';
import { useTaskStore } from '../stores/taskStore.js';
import { useLoginStore } from '../stores/loginStore.js';
import 'animate.css';

const taskStore = useTaskStore();
const tasks = taskStore.getTasks();
const statusStore = useStatusStore();
const statuses = statusStore.getStatuses();
const selectedStatuses = ref([]);

const notiStore = useNotiStore();
const loginStore = useLoginStore();

const router = useRouter();
const route = useRoute();

const getAllStatus = async (id) => {
    try {
        const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v3/boards/${id}/statuses`, loginStore.getToken());
        statuses.value = data;
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
};

const getAllTasks = async (id) => {
    try {
        const queryParams = new URLSearchParams();
        if (selectedStatuses.value.length > 0) {
            queryParams.append('filterStatuses', selectedStatuses.value.join(','));
        }
        const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v3/boards/${id}/tasks?${queryParams.toString()}`, loginStore.getToken());
        if (data.status === 401) {
            router.push({ name: "Login" })
        }
        tasks.value = data;
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
    }
};

const confirmDeleteModal = ref(false);
const deleteTransferModal = ref(false);

const closeConfirmModal = () => {
    confirmDeleteModal.value = false;
};

const closeDeleteTransferModal = () => {
    deleteTransferModal.value = false;
};

const closeConfirmDeleteModal = () => {
    confirmDeleteModal.value = false;
}

const editStatus = (status) => {
    const statusName = status.name.toLowerCase();
    if (statusName.includes("no status")) {
        notiStore.setNotificationMessage("Cannot edit status named 'No Status'");
        notiStore.setShowNotification(true);
        notiStore.setNotificationType("error");
        return;
    }
    router.push({ name: 'EditBoardStatus', params: { status: status.id } });
};

const statusToDelete = ref({ id: "", name: "", modal: false })

const deleteStatus = async (statusId) => {
    try {
        const id = route.params.id;
        const res = await deleteItem(`${import.meta.env.VITE_BASE_URL}/v3/boards/${id}/statuses/${statusId}`, loginStore.getToken());
        // Check if the deletion was successful (HTTP status code 200 means success)
        if (res === 200) {
            statusStore.removeStatuses(res)
            statuses.value = statuses.value.filter(status => status.id !== id);
            notiStore.setNotificationMessage(`The status "${statusToDelete.value.name}" is deleted successfully`);
            notiStore.setShowNotification(true);
            notiStore.setNotificationType("success");
            closeConfirmModal();
        } else if (res === 404) {
            console.error(`Failed to delete status with ID ${id}. Status does not exist.`);
            notiStore.setNotificationMessage(`An error occurred deleting the status "${statusToDelete.value.name}"`);
            notiStore.setShowNotification(true);
            notiStore.setNotificationType("error");
            closeConfirmModal();
        } else {
            console.error(`Failed to delete status with ID ${id} HTTP status: ${res}`);
        }
    } catch (error) {
        console.error(`Failed to delete status with ID ${id}:`, error);
    }
};

const checkStatusUsage = (statusId) => {
    const status = statuses.value.find(status => status.id === statusId);
    if (!status) {
        console.error(`Status with ID ${statusId} not found.`);
        return;
    }
    if (status.name.toLowerCase() === "no status") {
        notiStore.setNotificationMessage("Cannot delete status named 'No Status'");
        notiStore.setShowNotification(true);
        notiStore.setNotificationType("error");
        return;
    }
    const isUsed = tasks.value.some(task => task.status === status.name);
    if (isUsed) {
        openDeleteTransferModal(status);
    } else {
        openConfirmModal(status);
    }
};

const openDeleteTransferModal = (status) => {
    statusToDelete.value = status;
    deleteTransferModal.value = true;
};

const openConfirmModal = (status) => {
    statusToDelete.value = status;
    confirmDeleteModal.value = true;
};

const newStatusId = ref({ id: "", name: "", description: "" });
const deleteStatusWithTransfer = async () => {
    try {
        const boardId = route.params.id;
        const res = await deleteTransfer(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/statuses`, statusToDelete.value.id, newStatusId.value.id, loginStore.getToken());
        if (res === 200) {
            // ลบ status เดิมออกจาก store
            statusStore.removeStatuses(statusToDelete.value.id);
            // เพิ่ม status ใหม่เข้าไปใน store (ถ้ามีการย้าย task ไป status ใหม่)
            if (newStatusId.value.id && newStatusId.value.name) {
                statusStore.addStatus(newStatusId.value);
            }
            notiStore.setNotificationMessage("Transfer and delete operation successful");
            notiStore.setShowNotification(true);
            notiStore.setNotificationType("success");
            closeDeleteTransferModal();
        } else {
            console.error('Failed to transfer and delete status:', res.statusText);
            notiStore.setNotificationMessage('An error occurred during the transfer and delete operation');
            notiStore.setShowNotification(true);
            notiStore.setNotificationType("error");
            closeDeleteTransferModal();
        }
    } catch (error) {
        console.error('Error transferring and deleting status:', error);
        notiStore.setNotificationMessage('An error occurred during the transfer and delete operation');
        notiStore.setShowNotification(true);
        notiStore.setNotificationType("error");
        closeDeleteTransferModal();
    }
};

const filteredStatuses = computed(() => {
    return statuses.value.filter(status => status.id !== statusToDelete.value.id);
});

onBeforeMount(() => {
    const id = route.params.id;
    getAllStatus(id);
    getAllTasks(id);
});
</script>

<template>
    <header class="pt-8 pb-8 flex justify-center">
        <h1
            class="mb-4 text-4xl text-center font-extrabold leading-none tracking-tight text-[rgb(51,56,145)] sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
            {{ loginStore.getName() }} <span class="text-gray-900 dark:text-white"> Personal Board</span></h1>
    </header>
    <Profile />
    <div class="flex justify-center w-auto">
        <Notification :message="notiStore.notificationMessage" v-if="notiStore.showNotification" />
    </div>
    <div class="max-h-screen dark:bg-gray-800 flex justify-center">
        <div class="w-full max-w-screen-lg px-8">
            <div class="flex pb-2 gap-2 justify-between">
                <div class="flex gap-4">
                    <RouterLink :to="{ name: 'Board' }">
                        <button
                            class="itbkk-button-home bg-slate-100 px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-200 text-black hover:bg-green-400 hover:text-[#f0f0f0]">Home</button>
                    </RouterLink>
                    <RouterLink :to="{ name: 'TaskBoard' }">
                        <button
                            class="itbkk-button-task bg-[#4d8cfa] px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-150 text-white hover:bg-[#0062ff] hover:text-[#f0f0f0]">Task</button>
                    </RouterLink>
                </div>
                <div>
                    <button @click="router.push({ name: 'AddBoardStatus' })"
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

    <!-- Delete Transfer Modal -->
    <div class="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-70 flex justify-center items-center text-white scale-125 z-50"
        v-if="deleteTransferModal">
        <div class="itbkk-message bg-gray-800 p-4 rounded-lg w-96 border-[4px] border-[#37373D]">
            <!-- Modal content -->
            <h3 class="text-[#FFC745] font-bold text-lg">Delete Status with Transfer</h3>
            <hr>
            <div class="text-center overflow-hidden">
                <p>Deleting this status will transfer its tasks to another status.</p>
                <!-- You can add a select dropdown here to choose the status for transferring tasks -->
                <label for="transferStatus" class="block text-sm font-medium text-gray-300">Transfer tasks to:</label>
                <select id="transferStatus" name="transferStatus" v-model="newStatusId.id"
                    class="mt-1 block w-full p-2 rounded-md bg-gray-700 text-gray-300">
                    <option v-for="status in filteredStatuses" :key="status.id" :value="status.id">{{ status.name }}
                    </option>
                </select>

            </div>
            <div class="flex justify-center mt-4">
                <button
                    class="itbkk-button-confirm btn bg-green-600 hover:bg-green-500 border-0 mr-4 flex-grow hover:scale-105 duration-150 text-white"
                    @click="deleteStatusWithTransfer(statusToDelete.id)">Delete with Transfer</button>
                <button
                    class="itbkk-button-cancel btn bg-red-500 hover:bg-red-600 border-0 flex-grow hover:scale-105 duration-200 text-white"
                    @click="closeDeleteTransferModal">Cancel</button>
            </div>
        </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div class="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-70 flex justify-center items-center text-white scale-125 z-50"
        v-if="confirmDeleteModal">
        <div class="itbkk-message bg-gray-800 p-4 rounded-lg w-96 border-[4px] border-[#37373D]">
            <!-- Modal content -->
            <h3 class="text-[#FFC745] font-bold text-lg">Confirm Delete</h3>
            <hr>
            <div class="text-center overflow-hidden">
                <p>Are you sure you want to delete the status "{{ statusToDelete.name }}"?</p>
            </div>
            <div class="flex justify-center mt-4">
                <button
                    class="itbkk-button-confirm btn bg-green-600 hover:bg-green-500 border-0 mr-4 flex-grow hover:scale-105 duration-150 text-white"
                    @click="deleteStatus(statusToDelete.id)">Confirm</button>
                <button
                    class="itbkk-button-cancel btn bg-red-500 hover:bg-red-600 border-0 flex-grow hover:scale-105 duration-200 text-white"
                    @click="closeConfirmDeleteModal">Cancel</button>
            </div>
        </div>
    </div>
    <RouterView />
</template>

<style scoped></style>