<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { getItems } from "../libs/fetchUtils.js"
import { useRoute } from 'vue-router';
import { useLoginStore } from '../stores/loginStore.js';

const route = useRoute();
const boardId = route.params.id
const loginStore = useLoginStore();

const tasksId = ref({ id: "", title: "", description: "", assignees: "", status: "", createdOn: "", updatedOn: "" })
const getTasksById = async (task) => {
    try {
        const  data  = await getItems(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/tasks/${task}`, loginStore.getToken());
        if (data) {
            tasksId.value = data;
        } else {
            console.warn(`Task with ID ${task} not found.`);
        }
    } catch (error) {
        console.error(`Failed to fetch task with ID ${task}:`, error);
    }
}

onBeforeMount(() => {
    const taskId = route.params.task;
    getTasksById(taskId);
});

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
</script>

<template>
    <!-- Task Modal -->
    <div class="itbkk-modal-task fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center text-white z-50 animate__backInUp transition ease-in-out duration-200">
        <div class="bg-[#222222] p-4 rounded-md w-[53em] max-h-[35em] border-[6px] border-[#37373D]">
            <div class="flex flex-col items-center text-xl">
                <form class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div class="w-96">
                        <label for="title" class="block pb-1">Title</label>
                        <textarea id="title" maxlength="100" v-model.trim="tasksId.title" disabled
                            class="itbkk-title hide p-2 mt-1 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-[3px] border-gray-300 rounded-md"></textarea>
                    </div>
                    <div class=" w-96">
                        <label for="assignees" class="block">Assignees</label>
                        <textarea v-if="!tasksId.assignees" id="assignees" disabled
                            class="itbkk-assignees text-gray-500 italic p-2 mt-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-[3px] border-gray-300 rounded-md">Unassigned</textarea>
                        <textarea v-else id="assignees" maxlength="30" v-model.trim="tasksId.assignees" disabled
                            class="itbkk-assignees p-2 mt-2 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-[3px] border-gray-300 rounded-md"></textarea>
                    </div>
                    <div class="w-96">
                        <label for="status" class="block">Status</label>
                        <textarea id="status" v-model="tasksId.status" disabled
                            class="itbkk-status text-xl bg-[#151515] font-semi bold h-16 p-2 mt-1 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm border-[3px] border-gray-300 rounded-md">
                        </textarea>
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
                        <textarea v-if="!tasksId.description" id="description" maxlength="500" rows="5" disabled
                            class="itbkk-description text-gray-500 italic p-2 mt-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-[3px] border-gray-300 rounded-md">No Description Provided</textarea>
                        <textarea v-else v-text.trim="tasksId.description" id="description" maxlength="500" rows="5"
                            disabled
                            class="itbkk-description p-2 mt-1 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-[3px] border-gray-300 rounded-md" />
                    </div>
                </form>
            </div>
            <div class="flex justify-end gap-2 mr-4">
                <RouterLink :to="{ name: 'TaskBoard' }">
                    <button class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded w-24">
                        Close
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