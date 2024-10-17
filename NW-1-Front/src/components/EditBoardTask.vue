<script setup>
import { ref, onBeforeMount, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTaskStore } from '../stores/taskStore.js';
import { getItems, editTask } from '../libs/fetchUtils.js';
import { useNotiStore } from '../stores/notificationStore.js';
import { useStatusStore } from '../stores/statusStore.js';
import { useLoginStore } from '../stores/loginStore.js';
import { useBoardStore } from "@/stores/boardStore";

const notiStore = useNotiStore();
const taskStore = useTaskStore();
const statusStore = useStatusStore();
const statuses = statusStore.getStatuses();
const loginStore = useLoginStore();
const boardStore = useBoardStore();
const boards = boardStore.getBoards()

const route = useRoute();
const router = useRouter();

const getAllStatus = async (id) => {
    try {
        const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v3/boards/${id}/statuses`, loginStore.getToken());
        statuses.value = data;
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
};

const tasksId = ref({ id: "", title: "", description: "", assignees: "", status: "", createdOn: "", updatedOn: "" })
const originalTask = ref(null);
const getTasksById = async (task) => {
    try {
        const boardId = route.params.id;
        const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/tasks/${task}`, loginStore.getToken());
        if (data) {
            tasksId.value = data;
            originalTask.value = { ...data };
        } else {
            console.warn(`Task with ID ${task} not found.`);
        }
    } catch (error) {
        console.error(`Failed to fetch task with ID ${id}:`, error);
    }
}

onBeforeMount(() => {
    const id = route.params.id; // Get the task ID from the router parameters
    const taskId = route.params.task;
    getTasksById(taskId);
    getAllStatus(id);
});

const saveTask = async () => {
    try {
        const boardId = route.params.id;
        if (!tasksId.value.status) {
            tasksId.value.status = "No Status";
        }
        const { data, status } = await editTask(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/tasks/${tasksId.value.id}`, tasksId.value, loginStore.getToken());
        if (status === 400) {
            notiStore.setNotificationMessage(`Please choose status`);
            notiStore.setNotificationType("error");
            notiStore.setShowNotification(true);
            router.push({ name: 'TaskBoard' })
            return
        }
        taskStore.editTask(data);
        notiStore.setNotificationMessage(`The task "${tasksId.value.title}" has been updated`);
        notiStore.setNotificationType("success");
        notiStore.setShowNotification(true);
        // Reset form and navigate back to task list
        tasksId.value = { id: "", title: "", description: "", assignees: "", status: "", createdOn: "", updatedOn: "" };
        router.push({ name: 'TaskBoard' });
    } catch (error) {
        notiStore.setNotificationMessage(`An error occurred updating the task "${tasksId.value.title}"`);
        notiStore.setNotificationType("error");
        notiStore.setShowNotification(true);
        console.error('Error saving task:', error);
        router.push({ name: 'TaskBoard' });
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
    const isStatusSelected = tasksId.value.status && tasksId.value.status !== "";
    const isDataChanged =
        (tasksId.value.title || "") !== (originalTask.value?.title || "") ||
        (tasksId.value.description || "") !== (originalTask.value?.description || "") ||
        (tasksId.value.assignees || "") !== (originalTask.value?.assignees || "") ||
        tasksId.value.status !== originalTask.value?.status;
    return isStatusSelected && isDataChanged;
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
onMounted(() => {
  getBoardId();
});

const hasPermission = computed(() => {
    return loginStore.getUserId() === boardOwnerId.value; // เช็คว่าผู้ใช้เป็นเจ้าของหรือไม่
});
</script>

<template>
    <!-- Task Modal -->
    <div class="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center text-white z-50">
        <div class="bg-[#222222] p-4 rounded-md w-[53em] max-h-[35em] border-[6px] border-[#37373D]">
            <div class="flex flex-col items-center text-xl">
                <form class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div class="w-96">
                        <label for="title" class="block pb-1">Title</label>
                        <textarea id="title" maxlength="100" v-model.trim="tasksId.title"
                            class="itbkk-title p-2 mt-1 hide text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-[3px] border-gray-300 rounded-md"></textarea>
                    </div>
                    <div class=" w-96">
                        <label for="assignees" class="block">Assignees</label>
                        <textarea v-if="!tasksId.assignees" v-model.trim="tasksId.assignees" id="assignees"
                            class="itbkk-assignees text-gray-500 italic p-2 mt-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-[3px] border-gray-300 rounded-md">Unassigned</textarea>
                        <textarea v-else id="assignees" maxlength="30" v-model.trim="tasksId.assignees"
                            class="itbkk-assignees p-2 mt-2 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-[3px] border-gray-300 rounded-md"></textarea>
                    </div>
                    <div class="w-96">
                        <label for="status" class="block">Status</label>
                        <select id="status" v-model="tasksId.status" required
                            class="itbkk-status text-xl bg-[#151515] font-semi bold h-[60.8px] p-2 mt-1 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm border-[3px] border-gray-300 rounded-md">
                            <option value="" disabled>Select Status</option>
                            <option v-for="status in statuses" :value="status.id" :key="status.id">{{ status.name }}
                            </option>
                        </select>
                    </div>
                    <div class="w-96">
                        <label for="timezone" class="block">TimeZone</label>
                        <textarea id="timezone" disabled
                            class="itbkk-timezone p-2 mt-1 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-[3px] border-gray-300 rounded-md">{{ timeZone }}</textarea>
                    </div>
                    <div class="w-96 text-center">
                        <label for="createdOn" class="block">Created On</label>
                        <textarea id="createdOn" rows="1" disabled
                            class="itbkk-created-on text-center p-2 mt-1 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-[3px] border-gray-300 rounded-md">{{ formattedCreatedOn }}</textarea>
                    </div>
                    <div class="w-96 text-center">
                        <label for="updatedOn" class="block">Updated On</label>
                        <textarea id="updatedOn" rows="1" disabled
                            class="itbkk-updated-on text-center p-2 mt-1 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-[3px] border-gray-300 rounded-md">{{ formattedUpdatedOn }}</textarea>
                    </div>
                </form>
                <form class="my-4 flex">
                    <div class="w-[39em]">
                        <label for="description" class="block">Description</label>
                        <textarea v-if="!tasksId.description" v-model.trim="tasksId.description" id="description" maxlength="500" rows="5"
                            class="itbkk-description text-gray-500 italic p-2 mt-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-[3px] border-gray-300 rounded-md">No Description Provided</textarea>
                        <textarea v-else v-model.trim="tasksId.description" id="description" maxlength="500" rows="5"
                            class="itbkk-description p-2 mt-1 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-[3px] border-gray-300 rounded-md"></textarea>
                    </div>
                </form>
            </div>
            <div class="flex justify-end items-center gap-2 mr-4">
                <p v-if="!hasPermission" class="text-red-400 text-[20px]">You need to be board owner to perform this action.</p>
                <button @click="saveTask" :disabled="!isFormValid() || !hasPermission"
                    class="bg-[#4CAF50] hover:bg-[#43A047] text-white py-2 px-4 rounded-lg shadow disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed">Save</button>
                <RouterLink :to="{ name: 'TaskBoard' }">
                    <button class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded w-24">
                        Cancel
                    </button>
                </RouterLink>
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