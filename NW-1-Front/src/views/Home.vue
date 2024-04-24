<script setup>
import { ref, onBeforeMount } from "vue";
import { getItems } from "../libs/fetchUtils.js"

const tasks = ref(null)
const taskId = ref(null)

const getTasks = async () => {
  try {
    const data = await getItems(`http://localhost:8080/v1/tasks`);
    tasks.value = data;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
  }
};
onBeforeMount(() => {
  getTasks();
});

const getTasksById = async (taskId) => {
  try {
    const data = await getItems(`http://localhost:8080/v1/tasks/${id}`);
    taskId.value = data;
  } catch (error) {
    console.error(`Failed to fetch task with ID ${id}:`, error);
  }
};

const showTaskModal = ref(false)

const openTaskModal = () => {
  showTaskModal.value = true
}
const closeTaskModal = () => {
  showTaskModal.value = false
}

</script>

<template>
  <input type="checkbox" value="dracula" class="toggle theme-controller m-2 absolute top-0 right-0" />
  <div class="flex justify-center mt-10">
    <div
      class="overflow-x-auto border-[6px] border-slate-600 rounded-2xl h-[24em] hide m-4 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]">
      <table class="table table-zebra table-pin-rows text-center">
        <!-- head -->
        <thead class="text-3xl">
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Assignees</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr class="itbkk-item text-[1.2em]" v-for="task in tasks" :key="task.id">
            <td class="itbkk-id">{{ task.id }}</td>
            <button>
              <td class="itbkk-title cursor-pointer" @click="openTaskModal">{{ task.title }}</td>
            </button>
            <td class="itbkk-assignees">{{ task.assignees }}</td>
            <td class="itbkk-status">{{ task.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <!-- Task Modal -->
  <div v-if="showTaskModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80">
    <div class="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
      <div class="flex flex-col items-center">
        <h2 class="text-2xl font-semibold mb-4">Modal Title</h2>
        <div class="mb-4">
          <p>ID</p>
        </div>
        <button @click="closeTaskModal" class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
          Close Modal
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hide::-webkit-scrollbar {
  display: none;
}
</style>