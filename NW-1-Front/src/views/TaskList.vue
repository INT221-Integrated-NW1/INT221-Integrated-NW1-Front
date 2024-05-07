<script setup>
import { onBeforeMount, ref } from "vue";
import Notification from "../components/Notification.vue";
import { getItems, deleteItemById } from "../libs/fetchUtils.js"
import { useRouter, RouterView } from "vue-router";
import { useTaskStore } from '../stores/taskStore.js';
import { useNotiStore } from '../stores/notificationStore.js';
import 'animate.css';

const taskStore = useTaskStore();
const tasks = taskStore.getTasks();
const notiStore = useNotiStore();

const router = useRouter()

const getAllTasks = async () => {
  try {
    const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v1/tasks`);
    tasks.value = data;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
  }
};

const formatStatus = (status) => {
  switch (status) {
    case "NO_STATUS":
      return "No Status";
    case "TO_DO":
      return "To Do";
    case "DOING":
      return "Doing";
    case "DONE":
      return "Done";
    default:
      return status;
  }
};

const deleteConfirmModal = ref(false);
const taskToDelete = ref(null);

const openConfirmModal = (task) => {
  taskToDelete.value = task;
  deleteConfirmModal.value = true;
};

const closeConfirmModal = () => {
  deleteConfirmModal.value = false;
  taskToDelete.value = null;
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
      // Close confirm modal
      
      closeConfirmModal();
      refreshTasks();
      
    } else {
      console.error(`Failed to delete task with ID ${id}. HTTP status: ${status}`);
    }
  } catch (error) {
    console.error(`Failed to delete task with ID ${id}:`, error);
  }
};

// Method to refresh tasks
const refreshTasks = async () => {
  await getAllTasks();
};

// Add this inside the if statement where tasks are deleted successfully
refreshTasks();

onBeforeMount(() => {
  getAllTasks();
});
</script>

<template>
  <header class="lobster-regular text-[#FC4100] head-shadow text-center mt-4 text-[3rem] font-extrabold mb-6">
    <h1>
      IT-Bangmod Kradan Kanban
      <!-- Hex Codes: #2BAF90, #A1D4B1, #F1A512, #DD4111, #8C0027 -->
    </h1>
  </header>
  <!-- <div class="flex justify-end absolute right-[8rem] top-[10rem]">
    <button @click="router.push('/task/add')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="w-8 h-8 rounded-md fill-[#00215E]">
        <path
          d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
      </svg>
    </button>
  </div> -->
  <!-- <img src="/images/pin.png" height="50px" width="50px" class="absolute inset-0 left-100"> -->

  <div v-if="tasks.length === 0" class="flex justify-center">
    <button class="itbkk-button-add" @click="router.push('/task/add')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="w-8 h-8 rounded-md fill-[#00215E]">
        <path
          d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
      </svg>
    </button>
    <div
      class="overflow-x-auto border-[4px] border-slate-600 rounded-lg hide m-4 hover:shadow-[rgba(200,200,200,0.7)0_0px_100px_] transition-shadow mt-8">
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

  <div v-else class="flex justify-center flex-wrap">
    <div>
      <Notification :message="notiStore.notificationMessage" v-if="notiStore.showNotification" duration="5000" />
    </div>
    <div class="flex">
      <button @click="router.push('/task/add')" class="m-2 itbkk-button-add">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
          class="w-[3rem] h-[3rem] rounded-md bg-[#c5daff] fill-[#00215E] hover:scale-125 duration-150">
          <path
            d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
        </svg>
      </button>
      <div
        class="overflow-x-auto border-[4px] border-slate-600 rounded-lg h-[25em] hide hover:shadow-[rgba(200,200,200,0.7)0_0px_100px_] transition-shadow">
        <table class="table table-zebra table-pin-rows text-center w-full">
          <thead class="text-3xl">
            <tr class="lobster-regular text-black">
              <th>Id</th>
              <th></th>
              <th>Title</th>
              <th>Assignees</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr class="itbkk-item text-[1.2em]" v-for="(task, index) in tasks" :key="index">
              <td class="itbkk-id">{{ index + 1 }}</td>
              <td class="p-0">
                <button class="text-[1.8em] dropdown dropdown-right">
                  <div tabindex="0" class="itbkk-button-action">⋮</div>
                  <ul tabindex="0" class="dropdown-content z-10 menu mt-2 p-2 shadow bg-base-100 rounded-box w-52">
                    <li><a @click="router.push(`/task/${task.id}/edit`)" class="itbkk-button-edit">Edit</a></li>
                    <li><a @click="openConfirmModal(task)" class="itbkk-button-delete">Delete</a></li>
                  </ul>
                </button>
              </td>
              <button>
                <td
                  class="itbkk-title overflow-hidden cursor-pointer hover:no-underline max-w-[45rem] hover:bg-blue-100 rounded-lg hover:text-blue-600 transition ease-in-out duration-300"
                  @click="router.push(`/task/${task.id}`)">{{ task.title }}</td>
              </button>
              <td class="itbkk-assignees italic text-gray-500" v-if="!task.assignees">Unassigned</td>
              <td class="itbkk-assignees italic" v-else.trim>{{ task.assignees }}</td>
              <td class="itbkk-status">{{ formatStatus(task.status) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

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
        <button class="itbkk-button-confirm btn btn-success mr-4 flex-grow hover:scale-105 duration-150 text-white"
          @click="deleteTask(taskToDelete.id)">Confirm</button>
        <button class="itbkk-button-cancel btn btn-error flex-grow hover:scale-105 duration-200 text-white"
          @click="closeConfirmModal">Cancel</button>
      </div>
    </div>
  </div>
  <RouterView />
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lobster&display=swap');

.hide::-webkit-scrollbar {
  display: none;
}

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

/* Hex Codes: #2BAF90, #A1D4B1, #F1A512, #DD4111 , #ed673e, #8C0027*/
</style>