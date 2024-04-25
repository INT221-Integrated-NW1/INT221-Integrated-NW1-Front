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
              <td class="itbkk-title cursor-pointer underline" @click="openTaskModal">{{ task.title }}</td>
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
        <form>
          <div class="mb-4">
            <label for="editPlaylistImage" class="block pb-1 text-sm font-medium">Image</label>
            <!-- Input for editing the playlist image -->
            <input type="file" id="editPlaylistImage" accept="image/*"/>
          </div>
          <div class="mb-4">
            <label for="editPlaylistName" class="block text-sm font-medium">Name</label>
            <!-- Input for editing the playlist name -->
            <input type="text" id="editPlaylistName"
              class="p-2 mt-1 text-[#FFC745] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
          </div>
          <div class="mb-4">
            <label for="editPlaylistDescription" class="block text-sm font-medium ">Description</label>
            <!-- Input for editing the playlist description -->
            <textarea id="editPlaylistDescription" rows="3"
              class="p-2 mt-1 text-[#FFC745] focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md resize-none"></textarea>
          </div>
          <div class="flex justify-end">
            <button type="submit" class="mr-2 btn btn-success text-white">Save</button>
            <button type="button" class="btn btn-error text-white" @click="closeModal">Cancel</button>
          </div>
        </form>

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
</style>