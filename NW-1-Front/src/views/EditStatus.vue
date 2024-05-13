<script setup>
import { ref, onBeforeMount } from 'vue';
import { getItems } from "../libs/fetchUtils.js"
import { useRoute, useRouter } from 'vue-router';
import { editItem } from '../libs/fetchUtils.js';
import { useNotiStore } from '../stores/notificationStore.js';
import { useStatusStore } from '../stores/statusStore.js';

const notiStore = useNotiStore();
const statusStore = useStatusStore();

const route = useRoute();
const router = useRouter();

const statusId = ref({ id: "", name: "", description: "" })
const statusIdOriginal = ref({ id: "", name: "", description: "" })

const getStatusById = async (id) => {
    try {
        const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v2/statuses/${id}`);
        statusId.value = data;
        statusIdOriginal.value = { ...data };
    } catch (error) {
        console.error(`Failed to fetch status with ID ${id}:`, error);
    }
}

onBeforeMount(() => {
    const id = route.params.id; // Get the task ID from the router parameters
    getStatusById(id);
});

const saveStatus = async () => {
    try {
        if (!statusId.value.status) {
            statusId.value.status = "No Status";
        }
        const updatedStatus = await editItem(`${import.meta.env.VITE_BASE_URL}/v2/statuses/${statusId.value.id}`, statusId.value);
        statusStore.editStatus(updatedStatus); // Update status in store

        // Set notification
        notiStore.setNotificationMessage(`The status "${statusId.value.name}" has been updated`);
        notiStore.setNotificationType("success");
        notiStore.setShowNotification(true);
        // Reset form
        statusId.value = { id: "", name: "", description: "" };
        router.push({ name: 'StatusList' });
    } catch (error) {
        // Set error notification, corrected to use status name instead of task title
        notiStore.setNotificationMessage(`An error occurred, the status "${statusId.value.name}" does not exist. `);
        notiStore.setNotificationType("error");
        notiStore.setShowNotification(true);
        console.error('Error saving status:', error);
        router.push({ name: 'StatusList' });
    }
};

const isFormValid = () => {
    return (
        statusId.value.name.trim() !== statusIdOriginal.value.name.trim() ||
        statusId.value.description?.trim() !== statusIdOriginal.value.description?.trim() 
    );
};

</script>

<template>
    <div
        class="itbkk-modal-status bg-gray-900 bg-opacity-70 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full inset-0 max-h-full">
        <div class="relative p-4 w-full max-w-xl max-h-full">
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Add New Status
                    </h3>
                    <button @click="router.push({ name: 'StatusList' })" type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        data-modal-toggle="crud-modal">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                    </button>
                </div>
                <form class="p-4 pb-0 md:p-5 md:pb-0">
                    <div class="grid gap-4 mb-4 grid-cols-2">
                        <div class="itbkk-status-name col-span-2">
                            <label for="name"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                            <input type="text" id="name" v-model="statusId.name"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="Type status name" required="">
                        </div>
                        <div class="itbkk-status-description col-span-2">
                            <label for="description"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Description</label>
                            <textarea id="description" rows="4" v-model="statusId.description"
                                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 resize-none"
                                placeholder="Write status description here"></textarea>
                        </div>
                    </div>
                </form>
                <div class="flex justify-end gap-2 pb-2 mr-[20px]">
                    <button @click="saveStatus" :disabled="!isFormValid()"
                        :class="{ 'cursor-not-allowed opacity-50': !isFormValid() }"
                        class="bg-[#4CAF50] hover:bg-[#43A047] text-white py-2 px-4 rounded-lg w-24 shadow">
                        Save
                    </button>
                    <RouterLink :to="{ name: 'StatusList' }">
                        <button class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded w-24">
                            Cancel
                        </button>
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
label {
    font-weight: bolder;
}
</style>