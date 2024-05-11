<script setup>
import { onBeforeMount, ref } from "vue";
import Notification from "../components/Notification.vue";
import { getItems, deleteItemById } from "../libs/fetchUtils.js"
import { useRouter, RouterView } from "vue-router";
import { useTaskStore } from '../stores/taskStore.js';
import { useNotiStore } from '../stores/notificationStore.js';
import { useStatusStore } from '../stores/statusStore.js';
import 'animate.css';

const taskStore = useTaskStore();
const tasks = taskStore.getTasks();
const notiStore = useNotiStore();
const statusStore = useStatusStore();
const statuses = statusStore.getStatuses();

const router = useRouter()

const getAllTasks = async () => {
  try {
    const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v1/tasks`);
    tasks.value = data;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
  }
};

// const getAllStatus = async () => {
//   try {
//     const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v2/status`);
//     statuses.value = data;
//   } catch (error) {
//     console.error('Failed to fetch status:', error);
//   }
// };

const deleteConfirmModal = ref(false);
const taskToDelete = ref(null);

const openConfirmModal = (task) => {
  taskToDelete.value = task;
  deleteConfirmModal.value = true;
};

const closeConfirmModal = () => {
  taskToDelete.value = null;
  deleteConfirmModal.value = false;
};
const deleteTask = async (id) => {
  try {
    const status = await deleteItemById(`${import.meta.env.VITE_BASE_URL}/v1/tasks`, id);
    // Check if the deletion was successful (HTTP status code 200 means success)
    if (status === 200) {
      // Create a new array that doesn't include the deleted task
      tasks.value = tasks.value.filter(task => task.id !== id);
      console.log(`Task with ID ${id} deleted successfully.`);
      // Show success notification
      notiStore.setNotificationMessage('Task deleted successfully');
      notiStore.setShowNotification(true);
      notiStore.setNotificationType("success");
      // Close confirm modal
      closeConfirmModal();
    } else if (status === 404) {
      console.error(`Failed to delete task with ID ${id}. Task does not exist.`);
      // Show error message
      notiStore.setNotificationMessage('An error has occurred, the task does not exist.');
      notiStore.setShowNotification(true);
      notiStore.setNotificationType("error");
      closeConfirmModal();
    } else {
      console.error(`Failed to delete task with ID ${id}. HTTP status: ${status}`);
    }
  } catch (error) {
    console.error(`Failed to delete task with ID ${id}:`, error);
  }
};

onBeforeMount(() => {
  getAllTasks();
  // getAllStatus();
});
</script>

<template>
  <header class="pt-8 flex justify-center">
    <h1
      class="mb-4 text-4xl text-center font-extrabold leading-none tracking-tight text-[rgb(63,77,204)] sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
      IT-Bangmod<span class="text-gray-900 dark:text-white"> Kradan Kanban</span></h1>
  </header>
  <!-- Empty Table -->
  <div v-if="tasks.length === 0">
    <div class="flex justify-center pb-2 mt-6">
      <RouterLink :to="{ name: 'StatusList' }">
        <button
          class="bg-[#4d8cfa] px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-150 text-white hover:bg-[#0062ff] hover:text-[#f0f0f0]">Manage
          Status</button>
      </RouterLink>
    </div>
    <div class="flex justify-center">
      <div class="flex items-center">
        <button class="itbkk-button-add" @click="router.push('/task/add')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="w-8 h-8 rounded-md fill-[#00215E]">
            <path
              d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
          </svg>
        </button>
      </div>
      <div
        class="overflow-x-auto border-[4px] border-slate-600 rounded-lg hide  hover:shadow-[rgba(200,200,200,0.7)0_0px_100px_] transition-shadow">
        <table class="table table-zebra table-pin-rows text-center">
          <thead class="text-3xl">
            <tr class="lobster-regular text-black">
              <th>Id</th>
              <th>Title</th>
              <th>Assignees</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr class="itbkk-item text-[1.5em] lobster-regular">
              <td colspan="4">No Task</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <!-- Table with Tasks -->
  <div v-else class="mt-8">
    <div class="flex justify-center w-auto">
      <Notification :message="notiStore.notificationMessage" v-if="notiStore.showNotification" />
    </div>
    <div class="flex justify-center">
      <div class="max-h-screen flex justify-center">
        <div class="flex items-start pt-8">
          <button @click="router.push('/task/add')" class="itbkk-button-add">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
              class="w-[3rem] h-[3rem] rounded-md bg-[#c5daff] fill-[#00215E] hover:scale-125 duration-150">
              <path
                d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
            </svg>
          </button>
        </div>
        <div class="w-full max-w-screen-lg pl-2">
          <div class="flex justify-end pb-2">
            <RouterLink :to="{ name: 'StatusList' }">
              <button
                class="bg-[#4d8cfa] px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-150 text-white hover:bg-[#0062ff] hover:text-[#f0f0f0]">Manage
                Status</button>
            </RouterLink>
          </div>
          <div class="relative max-h-[24.5em] bg-[rgba(0,0,0,0.5)] overflow-x-auto hide shadow-md sm:rounded-lg">
            <table class="w-full text-sm text-left rtl:text-right table-fixed">
              <thead class="text-lg uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                <tr class="text-black">
                  <th class="px-6 py-3 w-[4%] text-center">Id</th>
                  <th class="px-6 py-3 w-[3%]"></th>
                  <th class="px-6 py-3 w-1/4 text-center">Title</th>
                  <th class="px-6 py-3 w-1/4 text-center">Assignees</th>
                  <th class="px-6 py-3 w-1/6 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="font-semibold">
                <tr v-for="(task, index) in tasks" :key="index"
                  class="itbkk-item text-[1.2em] odd:bg-white odd:dark:bg-gray-900 even:bg-slate-100 even:dark:bg-gray-800 transition hover:translate-x-4 duration-300 ease-in-out">
                  <td class="itbkk-id px-6 py-6 text-gray-900 whitespace-nowrap dark:text-white text-center">{{ index +
    1 }}</td>
                  <td class="p-0">
                    <button class="text-[1.8em] dropdown dropdown-right">
                      <div tabindex="0" class="itbkk-button-action">⋮</div>
                      <ul tabindex="0" class="dropdown-content menu mt-2 p-2 shadow bg-red-100 rounded-box w-52 z-[1]">
                        <li><a @click="router.push(`/task/${task.id}/edit`)"
                            class="itbkk-button-edit hover:bg-red-200">Edit</a></li>
                        <li><a @click="openConfirmModal(task)" class="itbkk-button-delete hover:bg-red-200">Delete</a>
                        </li>
                      </ul>
                    </button>
                  </td>
                  <td class="text-center">
                    <button
                      class="itbkk-title max-w-[12rem] truncate cursor-pointer hover:no-underline hover:bg-blue-100 rounded-lg hover:text-blue-600 transition ease-in-out duration-300"
                      @click="router.push(`/task/${task.id}`)">{{ task.title }}</button>
                  </td>
                  <td class="itbkk-assignees italic text-gray-500 text-center" v-if="!task.assignees">Unassigned</td>
                  <td class="itbkk-assignees italic text-center" v-else.trim>{{ task.assignees }}</td>
                  <td class="itbkk-status text-center">{{ task.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Delete Confirm Modal -->
  <div
    class="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-70 flex justify-center items-center text-white scale-125 z-50"
    v-if="deleteConfirmModal">
    <div class="bg-gray-800 p-4 rounded-lg w-96 border-[4px] border-[#37373D]">
      <h3 class="text-[#FFC745] font-bold text-lg ">Delete a Task</h3>
      <hr>
      <div class="text-center overflow-hidden">
        <p>Do you want to delete the task</p>
        <p>"{{ taskToDelete.title }}" ?</p>
      </div>
      <div class="flex justify-center mt-4">
        <button
          class="itbkk-button-confirm btn bg-green-600 hover:bg-green-500 border-0 mr-4 flex-grow hover:scale-105 duration-150 text-white"
          @click="deleteTask(taskToDelete.id)">Confirm</button>
        <button
          class="itbkk-button-cancel btn bg-red-500 hover:bg-red-600 border-0 flex-grow hover:scale-105 duration-200 text-white"
          @click="closeConfirmModal">Cancel</button>
      </div>
    </div>
  </div>
  <RouterView />
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lobster&display=swap');

.lobster-regular {
  font-family: "Lobster", sans-serif;
  font-weight: 200;
  font-style: normal;
}

.head-shadow {
  filter: drop-shadow(#FFC55A 3px 3px 0px)
}

.button-shadow {
  filter: drop-shadow(#2C4E80 3px 3px 0px)
}
</style>