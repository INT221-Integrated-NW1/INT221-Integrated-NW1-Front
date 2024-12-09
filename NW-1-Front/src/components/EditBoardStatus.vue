<script setup>
import { ref, onBeforeMount, computed, onMounted } from 'vue';
import { getItems, getItemsRes } from "../libs/fetchUtils.js"
import { useRoute, useRouter } from 'vue-router';
import { editItem } from '../libs/fetchUtils.js';
import { useNotiStore } from '../stores/notificationStore.js';
import { useStatusStore } from '../stores/statusStore.js';
import { useLoginStore } from '../stores/loginStore.js';
import { useBoardStore } from "@/stores/boardStore";

const notiStore = useNotiStore();
const statusStore = useStatusStore();
const statuses = statusStore.getStatuses();
const route = useRoute();
const router = useRouter();
const loginStore = useLoginStore();
const boardStore = useBoardStore();
const boards = boardStore.getBoards()

const statusId = ref({ id: "", name: "", description: "" })
const statusIdOriginal = ref({ id: "", name: "", description: "" })

const getStatusById = async (status) => {
    try {
        const boardId = route.params.id;
        const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/statuses/${status}`, loginStore.getToken());
        statusId.value = data;
        statusIdOriginal.value = { ...data };
    } catch (error) {
        console.error(`Failed to fetch status with ID ${boardId}:`, error);
    }
}

onBeforeMount(() => {
    const id = route.params.status; // Get the task ID from the router parameters
    getStatusById(id);
});

const saveStatus = async () => {
    try {
        // Check if the edited status name is unique
        const boardId = route.params.id;
        const isUnique = !statuses.value.some(status => status.name === statusId.value.name && status.id !== statusId.value.id);
        if (!isUnique) {
            notiStore.setNotificationMessage("Status name must be unique, please choose another name.");
            notiStore.setNotificationType("error");
            notiStore.setShowNotification(true);
            return;
        }
        const updatedStatus = await editItem(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/statuses/${statusId.value.id}`, statusId.value, loginStore.getToken());
        statusStore.editStatus(updatedStatus);
        notiStore.setNotificationMessage(`The status "${statusId.value.name}" has been updated`);
        notiStore.setNotificationType("success");
        notiStore.setShowNotification(true);
        statusId.value = { id: "", name: "", description: "" };
        router.push({ name: 'StatusBoard' });
    } catch (error) {
        notiStore.setNotificationMessage(`An error occurred, the status "${statusId.value.name}" could not be updated.`);
        notiStore.setNotificationType("error");
        notiStore.setShowNotification(true);
        console.error('Error saving status:', error); // Log the specific error for debugging
        router.push({ name: 'StatusBoard' });
    }
};
const isFormValid = () => {
    return (
        statusId.value.name?.trim() !== statusIdOriginal.value.name?.trim() ||
        statusId.value.description?.trim() !== statusIdOriginal.value.description?.trim()
    );
};

const boardOwnerId = ref(null);
const getBoardId = async () => {
    try {
        const id = route.params.id
        const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v3/boards/${id}`, loginStore.getToken());
        boards.value = data;
        boardOwnerId.value = data.user.oid
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
};

const haveWriteAccess = ref("")
const getCollaborateBoards = async () => {
    try {
        const id = route.params.id
        const { data, status } = await getItemsRes(`${import.meta.env.VITE_BASE_URL}/v3/boards/${id}/collabs`, loginStore.getToken());
        if (data) {
            const currentUserCollaborations = data.filter(
                (collaborator) => collaborator.oid === loginStore.getUserId()
            );
            haveWriteAccess.value = currentUserCollaborations.some(
                (collaboration) => collaboration.accessRight === "WRITE"
            );
        }
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
};

onMounted(() => {
    getBoardId();
    getCollaborateBoards()
});

const hasPermission = computed(() => {
    return loginStore.getUserId() === boardOwnerId.value || haveWriteAccess.value;
});
</script>

<template>
    <div
        class="itbkk-modal-status bg-gray-900 bg-opacity-70 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full inset-0 max-h-full">
        <div class="relative p-4 w-full max-w-xl max-h-full">
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Edit Status
                    </h3>
                    <button @click="router.push({ name: 'StatusBoard' })" type="button"
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
                            <input type="text" id="name" v-model.trim="statusId.name" maxlength="50"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="Type status name" required="">
                        </div>
                        <div class="itbkk-status-description col-span-2">
                            <label for="description"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Description</label>
                            <textarea id="description" rows="4" v-model.trim="statusId.description" maxlength="200"
                                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 resize-none"
                                placeholder="Write status description here"></textarea>
                        </div>
                    </div>
                </form>

                <div class="flex justify-end gap-2 pb-2 mr-[20px] items-center">
                    <p v-if="!hasPermission" class="text-red-400 text-[12px]">You need to be board owner to perform this action.</p>
                    <button @click="saveStatus" :disabled="!isFormValid() || !hasPermission"
                        class="bg-[#4CAF50] hover:bg-[#43A047] text-white py-2 px-4 rounded-lg w-24 shadow disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed">
                        Save
                    </button>
                    <RouterLink :to="{ name: 'StatusBoard' }">
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