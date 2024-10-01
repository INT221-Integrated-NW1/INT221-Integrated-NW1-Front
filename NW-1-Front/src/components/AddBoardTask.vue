<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { addItem, getItems } from '../libs/fetchUtils.js';
import { useStatusStore } from '../stores/statusStore.js';
import { useNotiStore } from '../stores/notificationStore.js';
import { useTaskStore } from '../stores/taskStore.js';
import { useLoginStore } from '../stores/loginStore.js';

const taskStore = useTaskStore();
const notiStore = useNotiStore();
const statusStore = useStatusStore();
const statuses = statusStore.getStatuses();
const loginStore = useLoginStore();

const router = useRouter();
const route = useRoute();

const addTask = ref({ id: "", title: "", description: "", assignees: "", status: "" })
const getAllStatus = async (id) => {
    try {
        const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v3/boards/${id}/statuses`, loginStore.getToken());
        statuses.value = data;
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
};

const saveTask = async () => {
    try {
        if (addTask.value.title.trim() === "") {
            notiStore.setNotificationMessage("Title cannot be empty");
            notiStore.setShowNotification(true);
            notiStore.setNotificationType("error");
            return;
        }
        if (!addTask.value.status) {
            addTask.value.status = 1;
        }
        const newTask = await addItem(`${import.meta.env.VITE_BASE_URL}/v3/boards/${id}/tasks`, addTask.value, loginStore.getToken());
        taskStore.addTask(newTask);
        notiStore.setNotificationMessage(`The task "${addTask.value.title}" is added successfully`);
        notiStore.setShowNotification(true);
        notiStore.setNotificationType("success");
        addTask.value = { title: "", description: "", assignees: "", status: "" };
        router.push({ name: 'TaskBoard' });
    } catch (error) {
        console.error('Error saving task:', error);
        notiStore.setNotificationMessage(`An error occurred adding the task "${addTask.value.title}`);
        notiStore.setShowNotification(true);
        notiStore.setNotificationType("error");
    }
};

const isFormValid = () => {
    return addTask.value.title.trim() !== ""
};

const id = route.params.id
onBeforeMount(() => {
    getAllStatus(id);
});
</script>

<template>
    <!-- Add Task Modal -->
    <div class="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center text-white z-50">
        <div class="bg-[#222222] p-6 rounded-md w-4/5 max-w-5xl border-4 border-[#37373D] shadow-lg scale-90">
            <div class="flex flex-col text-2xl">
                <h2 class="text-[#BFF1FF] mb-2 bg-[#333333] p-2">Add New Task</h2>
                <form class="grid grid-cols-1 gap-6 sm:grid-cols-2 w-full">
                    <div>
                        <label for="title" class="block pb-1">Title</label>
                        <textarea id="title" maxlength="100" v-model="addTask.title" required
                            class="p-3 mt-1 bg-gray-800 text-[#BFF1FF] focus:ring-[#BFF1FF] focus:border-[#BFF1FF] block w-full rounded-lg shadow-sm"></textarea>
                    </div>
                    <div>
                        <label for="assignees" class="block pb-1">Assignees</label>
                        <textarea id="assignees" maxlength="30" v-model="addTask.assignees" required
                            class="p-3 mt-1 bg-gray-800 text-[#BFF1FF] focus:ring-[#BFF1FF] focus:border-[#BFF1FF] block w-full rounded-lg shadow-sm"></textarea>
                    </div>
                    <select id="status" v-model="addTask.status" required
                        class="p-3 mt-1 bg-gray-800 text-[#BFF1FF] focus:ring-[#BFF1FF] focus:border-[#BFF1FF] block w-full rounded-lg shadow-sm">
                        <option disabled value="">Select Status</option>
                        <!-- Loop through status options -->
                        <option v-for="status in statuses" :value="status.id" :key="status.id">{{ status.name }}
                        </option>
                    </select>
                    <div class="col-span-2">
                        <label for="description" class="block pb-1">Description</label>
                        <textarea id="description" maxlength="500" rows="5" v-model="addTask.description" required
                            class="p-3 mt-1 bg-gray-800 text-[#BFF1FF] focus:ring-[#BFF1FF] focus:border-[#BFF1FF] block w-full rounded-lg shadow-sm"></textarea>
                    </div>
                </form>
                <div class="flex justify-end gap-4 mt-4">
                    <button @click="saveTask" :disabled="!isFormValid()"
                        class="itbkk-button-confirm bg-[#4CAF50] hover:bg-[#43A047] text-black py-2 px-4 rounded-lg shadow disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed">Save</button>
                    <button @click="router.push({ name: 'TaskBoard' })"
                        class="itbkk-button-cancel bg-[#F44336] hover:bg-[#E53935] text-white py-2 px-4 rounded-lg shadow">Cancel</button>
                </div>
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
