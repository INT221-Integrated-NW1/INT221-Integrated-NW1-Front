<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { getItems } from "../libs/fetchUtils.js"
import { useRoute, useRouter } from 'vue-router';
import { useTaskStore } from '../stores/taskStore.js';
import { editItem } from '../libs/fetchUtils.js';
import { useNotiStore } from '../stores/notificationStore.js';
import { useStatusStore } from '../stores/statusStore.js';

const notiStore = useNotiStore();
const taskStore = useTaskStore();
const statusStore = useStatusStore();
const statuses = statusStore.getStatuses();

const route = useRoute();
const router = useRouter();

const tasksId = ref({ id: "", title: "", description: "", assignees: "", status: "", createdOn: "", updatedOn: "" })
const originalTask = ref(null);
const getStatusById = async (id) => {
    try {
        const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v2/status/${id}`);
        if (data) {
            tasksId.value = data;
            originalTask.value = { ...data };
        } else {
            console.warn(`Task with ID ${id} not found.`);
        }
    } catch (error) {
        console.error(`Failed to fetch task with ID ${id}:`, error);
    }
}

onBeforeMount(() => {
    const id = route.params.id; // Get the task ID from the router parameters
    getStatusById(id);
});

const saveStatus = async () => {
    try {
        if (!tasksId.value.status) {
            tasksId.value.status = "No Status";
        }
        const updatedTask = await editItem(`${import.meta.env.VITE_BASE_URL}/v1/tasks/${tasksId.value.id}`, tasksId.value);
        // Update task in store
        taskStore.editTask(updatedTask);

        notiStore.setNotificationMessage(`The task "${tasksId.value.title}" has been updated`);
        notiStore.setNotificationType("success");
        notiStore.setShowNotification(true);

        // Reset form and navigate back to task list
        tasksId.value = { id: "", title: "", description: "", assignees: "", status: "", createdOn: "", updatedOn: "" };
        router.push('/task');
    } catch (error) {
        notiStore.setNotificationMessage(`An error occurred updating the task "${tasksId.value.title}"`);
        notiStore.setNotificationType("error");
        notiStore.setShowNotification(true);
        console.error('Error saving task:', error);
        router.push('/task');
    }
};

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    const formatDate = date.toLocaleDateString('en-GB');
    const formatTime = date.toLocaleTimeString('en-GB', { timeZone: `${timeZone}` });
    return `${formatDate} ${formatTime}`;
};

const formattedCreatedOn = computed(() => {
    return formatDateTime(tasksId.value.createdOn);
});

const formattedUpdatedOn = computed(() => {
    return formatDateTime(tasksId.value.updatedOn);
});

const isFormValid = () => {
    return (
        tasksId.value.title !== originalTask.value?.title ||
        tasksId.value.description !== originalTask.value.description ||
        tasksId.value.assignees !== originalTask.value.assignees ||
        tasksId.value.status !== originalTask.value.status
    );
};
</script>

<template>
     <!-- Add modal -->
     <div 
        class="itbkk-modal-status bg-gray-900 bg-opacity-70 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full inset-0 max-h-full">
        <div class="relative p-4 w-full max-w-xl max-h-full">
            <!-- Modal content -->
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                       edit status
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
</template>

<style scoped>
label {
    font-weight: bolder;
}

textarea {
    resize: none;
    font-size: medium;
    background: #151515;
}
</style>