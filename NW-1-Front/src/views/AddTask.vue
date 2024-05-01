<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();

import { getItems } from "../libs/fetchUtils.js"

const tasksId = ref({ id: "", title: "", description: "", assignees: "", status: "", createdOn: "", updatedOn: "" })
const getTasksById = async (id) => {
    try {
        const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v1/tasks/${id}`);
        if (data) {
            tasksId.value = data;
        } else {
            console.warn(`Task with ID ${id} not found.`);
        }
    } catch (error) {
        console.error(`Failed to fetch task with ID ${id}:`, error);
    }
}
onBeforeMount(() => {
    const id = route.params.id; // Get the task ID from the route parameters
    getTasksById(id);
});

const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    const formatDate = date.toLocaleDateString('en-GB');
    const formatTime = date.toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok' });
    return `${formatDate} ${formatTime}`;
};

const formattedCreatedOn = computed(() => {
    return formatDateTime(tasksId.value.createdOn);
});

const formattedUpdatedOn = computed(() => {
    return formatDateTime(tasksId.value.updatedOn);
});

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
</script>

<template>
    <!-- Add Task Modal -->
    <div class="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center text-white z-50">
        <div class="bg-[#222222] p-8 rounded-lg w-4/5 max-w-5xl border-4 border-[#37373D] shadow-lg">
            <div class="flex flex-col items-center text-2xl mb-4">
                <h2 class="text-[#BFF1FF] mb-2">Add New Task</h2>
                <form class="grid grid-cols-1 gap-6 sm:grid-cols-2 w-full">
                    <div>
                        <label for="title" class="block pb-1">Title</label>
                        <textarea id="title" maxlength="100" v-model.trim="tasksId.title"
                            class="p-3 mt-1 bg-gray-800 text-[#BFF1FF] focus:ring-[#BFF1FF] focus:border-[#BFF1FF] block w-full rounded-lg shadow-sm"></textarea>
                    </div>
                    <div>
                        <label for="assignees" class="block pb-1">Assignees</label>
                        <textarea v-if="!tasksId.assignees" id="assignees" disabled
                            class="p-3 mt-1 bg-gray-800 text-gray-400 italic focus:ring-[#BFF1FF] focus:border-[#BFF1FF] block w-full rounded-lg shadow-sm">Unassigned</textarea>
                        <textarea v-else id="assignees" maxlength="30" v-model.trim="tasksId.assignees"
                            class="p-3 mt-1 bg-gray-800 text-[#BFF1FF] focus:ring-[#BFF1FF] focus:border-[#BFF1FF] block w-full rounded-lg shadow-sm"></textarea>
                    </div>
                    <div>
                        <label for="status" class="block pb-1">Status</label>
                        <select id="status" v-model="tasksId.status"
                            class="p-3 mt-1 bg-gray-800 text-[#BFF1FF] focus:ring-[#BFF1FF] focus:border-[#BFF1FF] block w-full rounded-lg shadow-sm">
                            <option value="No_Status">No Status</option>
                            <option value="To_Do">To Do</option>
                            <option value="Doing">Doing</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label for="description" class="block pb-1">Description</label>
                        <textarea v-if="!tasksId.description" id="description" maxlength="500" rows="5" disabled
                            class="p-3 mt-1 bg-gray-800 text-gray-400 italic focus:ring-[#BFF1FF] focus:border-[#BFF1FF] block w-full rounded-lg shadow-sm">No Description Provided</textarea>
                        <textarea v-else id="description" v-model.trim="tasksId.description" maxlength="500" rows="5"
                            class="p-3 mt-1 bg-gray-800 text-[#BFF1FF] focus:ring-[#BFF1FF] focus:border-[#BFF1FF] block w-full rounded-lg shadow-sm"></textarea>
                    </div>
                </form>
            </div>
            <div class="flex justify-end gap-4 mt-4">
                <button @click="closeTaskModal"
                    class="bg-[#4CAF50] hover:bg-[#43A047] text-black py-2 px-4 rounded-lg shadow">Save</button>
                <router-link to="/task">
                    <button class="bg-[#F44336] hover:bg-[#E53935] text-white py-2 px-4 rounded-lg shadow">Close</button>
                </router-link>
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