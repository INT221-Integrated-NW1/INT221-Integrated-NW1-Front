<script setup>
import { ref } from 'vue';
import { addItem } from '../libs/fetchUtils.js';
import { tasks } from '../stores/taskStore.js';
import router from '@/router';

const addTask = ref({ title: "", description: "", assignees: "", status: "" })

const saveTask = async (event) => {
    event.preventDefault();
    try {
        if (addTask.value.status.trim() === "") {
            // ตั้งค่าเริ่มต้นหากสถานะว่าง
            addTask.value.status = "NO_STATUS";
        }
        const newTask = await addItem(`${import.meta.env.VITE_BASE_URL}/v1/tasks`, addTask.value);
        console.log('New task added:', newTask);
        // เพิ่ม task ใหม่ลงในรายการ tasks
        tasks.value.push(newTask);
        // รีเซ็ตฟอร์ม
        addTask.value = { title: "", description: "", assignees: "", status: "" };
        router.push('/task');
    } catch (error) {
        console.error('Error saving task:', error);
    }
};
</script>

<template>
    <!-- Add Task Modal -->
    <div class="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center text-white z-50">
        <div class="bg-[#222222] p-8 rounded-lg w-4/5 max-w-5xl border-4 border-[#37373D] shadow-lg scale-90">
            <div class="flex flex-col text-2xl mb-4">
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
                    <div>
                        <label for="status" class="block pb-1">Status</label>
                        <select id="status" v-model="addTask.status" required
                            class="p-3 mt-1 bg-gray-800 text-[#BFF1FF] focus:ring-[#BFF1FF] focus:border-[#BFF1FF] block w-full rounded-lg shadow-sm">
                            <option value="NO_STATUS">No Status</option>
                            <option value="TO_DO">To Do</option>
                            <option value="DOING">Doing</option>
                            <option value="DONE">Done</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label for="description" class="block pb-1">Description</label>
                        <textarea id="description" maxlength="500" rows="5" v-model="addTask.description" required
                            class="p-3 mt-1 bg-gray-800 text-[#BFF1FF] focus:ring-[#BFF1FF] focus:border-[#BFF1FF] block w-full rounded-lg shadow-sm"></textarea>
                    </div>
                    <div class="flex justify-end gap-4">
                        <button @click="saveTask"
                            class="bg-[#4CAF50] hover:bg-[#43A047] text-black py-2 px-4 rounded-lg shadow">Save</button>
                        <router-link to="/task">
                            <button
                                class="bg-[#F44336] hover:bg-[#E53935] text-white py-2 px-4 rounded-lg shadow">Cancel</button>
                        </router-link>
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