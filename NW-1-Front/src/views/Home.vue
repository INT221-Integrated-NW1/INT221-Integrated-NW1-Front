<script setup>
import { ref, onBeforeMount } from "vue";
import { getItems } from "../libs/fetchUtils.js"

const tasks = ref(null)

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

const editingTask = ref({ id: "", title: "", description: "", assignees: "", status: "", createdOn: "", updatedOn: "" })
//Modal Function
const showTaskModal = ref(false)
const openTaskModal = (task) => {
  editingTask.value = { ...task }
  showTaskModal.value = true
}
const closeTaskModal = () => {
  showTaskModal.value = false
}

</script>

<template>
  <header
    class="text-center mt-10 text-[4em] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
    <h1>
      IT-Bangmod Kradan Kanban
    </h1>
  </header>
  <div class="flex justify-center mt-5">
    <div
      class="overflow-x-auto border-[6px] border-slate-600 rounded-2xl h-[28em] hide m-4 hover:shadow-[rgba(200,200,200,0.7)0_0px_100px_] transition-shadow">
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
              <td class="itbkk-title cursor-pointer underline" @click="openTaskModal(task)">{{ task.title }}</td>
            </button>
            <td class="itbkk-assignees">{{ task.assignees }}</td>
            <td class="itbkk-status">{{ task.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <!-- Task Modal -->
  <div v-if="showTaskModal"
    class="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center text-white z-50">
    <div class="bg-[#222222] p-6 rounded-sm w-[53em] h-[36em] border-[6px] border-[#37373D]">
      <div class="flex flex-col items-center text-xl">
        <form class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="w-96">
            <label for="title" class="block pb-1">Title</label>
            <textarea id="title" maxlength="100" v-model="editingTask.title"
              class="itbkk-title p-2 mt-1 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
          </div>
          <div class=" w-96">
            <label for="assignees" class="block">Assignees</label>
            <textarea id="assignees" maxlength="30" v-model="editingTask.assignees"
              class="itbkk-assignees p-2 mt-1 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
          </div>
          <div class="w-96">
            <label for="status" class="block">Status</label>
            <select id="status" v-model="editingTask.status"
              class="itbkk-status text-xl font-semibold h-14 p-2 mt-1 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm border-gray-300 rounded-md">
              <option value="No Status">No Status</option>
              <option value="To Do">To Do</option>
              <option value="Doing">Doing</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div class="w-96">
            <label for="createdOn" class="block">Created On</label>
            <textarea id="createdOn" v-model="editingTask.createdOn"
              class="itbkk-created-on p-2 mt-1 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
          </div>
          <div class="w-96">
            <label for="updatedOn" class="block">Updated On</label>
            <textarea id="updatedOn" v-model="editingTask.updatedOn"
              class="itbkk-updated-on p-2 mt-1 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
          </div>
          <div class="w-96">
            <label for="timezone" class="block">TimeZone</label>
            <textarea id="timezone" v-model="editingTask.timezone"
              class="itbkk-timezone p-2 mt-1 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
          </div>
        </form>
        <form class="my-4 flex">
          <div class="w-[39em]">
            <label for="description" class="block">Description</label>
            <textarea id="description" maxlength="500" rows="5" v-model="editingTask.description"
              class="itbkk-description p-2 mt-1 text-[#BFF1FF] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
          </div>
        </form>
      </div>
      <div class="flex justify-end gap-2">
        <button @click="closeTaskModal" class="bg-green-500 hover:bg-green-600 text-black py-2 px-4 rounded w-24">
          Save
        </button>
        <button @click="closeTaskModal" class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded w-24">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hide::-webkit-scrollbar {
  display: none;
}

h1 {
  font-family: 'Fugaz One', cursive;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-shadow: 0px -6px 0 #212121,
    0px -6px 0 #212121,
    0px 6px 0 #212121,
    0px 6px 0 #212121,
    -6px 0px 0 #212121,
    6px 0px 0 #212121,
    -6px 0px 0 #212121,
    6px 0px 0 #212121,
    -6px -6px 0 #212121,
    6px -6px 0 #212121,
    -6px 6px 0 #212121,
    6px 6px 0 #212121,
    -6px 18px 0 #212121,
    0px 18px 0 #212121,
    6px 18px 0 #212121,
    0 19px 1px rgba(0, 0, 0, .1),
    0 0 6px rgba(0, 0, 0, .1),
    0 6px 3px rgba(0, 0, 0, .3),
    0 12px 6px rgba(0, 0, 0, .2),
    0 18px 18px rgba(0, 0, 0, .25),
    0 24px 24px rgba(0, 0, 0, .2),
    0 36px 36px rgba(0, 0, 0, .15);
}

label {
  font-weight: bolder;
}

textarea {
  resize: none;
  font-size: medium;
}
</style>