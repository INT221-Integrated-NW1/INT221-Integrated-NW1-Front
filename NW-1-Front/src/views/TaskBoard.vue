<script setup>
import { onMounted, onBeforeMount, ref, watch, computed } from "vue";
import Notification from "../components/Notification.vue";
import Profile from "../components/Profile.vue";
import VisibilityModal from "@/components/VisibilityModal.vue";
import { getItems, deleteItem, updateBoardVisibility } from "../libs/fetchUtils.js"
import { useRouter, RouterView, useRoute } from "vue-router";
import { useTaskStore } from '../stores/taskStore.js';
import { useStatusStore } from '../stores/statusStore.js';
import { useNotiStore } from '../stores/notificationStore.js';
import { useLoginStore } from '../stores/loginStore.js';
import { useBoardStore } from "@/stores/boardStore";
import 'animate.css';

const taskStore = useTaskStore();
const tasks = taskStore.getTasks();
const notiStore = useNotiStore();
const statusStore = useStatusStore();
const statuses = statusStore.getStatuses();
const loginStore = useLoginStore();
const boardStore = useBoardStore();
const boards = boardStore.getBoards()

const router = useRouter()
const route = useRoute();
const id = route.params.id;
const selectedStatuses = ref([]);
const boardOwnerId = ref(null);

const hasPermission = computed(() => {
    return loginStore.getUserId() === boardOwnerId.value; // เช็คว่าผู้ใช้เป็นเจ้าของหรือไม่
});

const getBoardId = async () => {
  try {
    const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v3/boards/${id}`, loginStore.getToken());
    boards.value = data;
    boardOwnerId.value = data.user.oid
    visibility.value = data.visibility;
    isPublic.value = data.visibility === 'PUBLIC' ? true : false;
  } catch (error) {
    console.error('Failed to fetch status:', error);
  }
};

onMounted(() => {
  getBoardId();
});

const getAllTasks = async (id) => {
  try {
    const queryParams = new URLSearchParams();
    if (selectedStatuses.value.length > 0) {
      queryParams.append('filterStatuses', selectedStatuses.value.join(','));
    }
    const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v3/boards/${id}/tasks?${queryParams.toString()}`, loginStore.getToken());
    tasks.value = data;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
  }
};

const getAllStatus = async (id) => {
  try {
    const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v3/boards/${id}/statuses`, loginStore.getToken());
    statuses.value = data;
    // Set selected statuses to all status names
    selectedStatuses.value = data.map(status => status.name);
  } catch (error) {
    console.error('Failed to fetch status:', error);
  }
};

const checkBox = ref(false);
const openCheckbox = () => {
  checkBox.value = !checkBox.value;
};

// Delete Modal
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
const deleteTask = async (task) => {
  try {
    const status = await deleteItem(`${import.meta.env.VITE_BASE_URL}/v3/boards/${id}/tasks/${task}`, loginStore.getToken());
    if (status === 200) {
      taskStore.removeTasks(status)
      notiStore.setNotificationMessage(`The task "${taskToDelete.value.title}" is deleted successfully`);
      notiStore.setShowNotification(true);
      notiStore.setNotificationType("success");
      closeConfirmModal();
    } else if (status === 404) {
      console.error(`Failed to delete task with ID ${id}. Task does not exist.`);
      notiStore.setNotificationMessage(`An error occurred deleting the task "${taskToDelete.value.title}"`);
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

const sortStatusByAsc = () => {
  tasks.value.sort((a, b) => {
    const nameA = (a.status.name !== undefined) ? a.status.name.toUpperCase() : a.status.toUpperCase();
    const nameB = (b.status.name !== undefined) ? b.status.name.toUpperCase() : b.status.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
};

const sortStatusByDesc = () => {
  tasks.value.sort((a, b) => {
    const nameA = (a.status.name !== undefined) ? a.status.name.toUpperCase() : a.status.toUpperCase();
    const nameB = (b.status.name !== undefined) ? b.status.name.toUpperCase() : b.status.toUpperCase();
    if (nameA < nameB) {
      return 1;
    }
    if (nameA > nameB) {
      return -1;
    }
    return 0;
  });
};

const resetSortOrder = () => {
  getAllTasks(id);
};

const sortOrder = ref('none');
const cycleSortOrder = () => {
  if (sortOrder.value === 'none') {
    sortStatusByAsc();
    sortOrder.value = 'asc';
  } else if (sortOrder.value === 'asc') {
    sortStatusByDesc();
    sortOrder.value = 'desc';
  } else {
    resetSortOrder();
    sortOrder.value = 'none';
  }
};

onBeforeMount(() => {
  getAllTasks(id);
  getAllStatus(id);
});

watch(statuses.value, () => {
  getAllStatus();
})

watch(selectedStatuses, async () => {
  await getAllTasks(id);
  if (sortOrder.value === 'asc') {
    sortStatusByAsc();
  } else if (sortOrder.value === 'desc') {
    sortStatusByDesc();
  }
});

const visibility = ref("");
const isPublic = ref(false);
const toggleVisibility = async () => {
  try {
    const newVisibility = isPublic.value ? 'PRIVATE' : 'PUBLIC';
    const result = await updateBoardVisibility(`${import.meta.env.VITE_BASE_URL}/v3/boards/${id}`, newVisibility, loginStore.getToken());
    if (result.status === 401) {
      loginStore.logout()
      router.push({ name: "Login" });
      return;
    }
    if (result.status === 403 || !hasPermission) {
      notiStore.setNotificationMessage("You do not have permission to change board visibility mode.")
      notiStore.setShowNotification(true)
      notiStore.setNotificationType("error");
      return;
    }
    visibility.value = result.data.visibility;
    isPublic.value = result.data.visibility === 'PUBLIC';
    notiStore.setNotificationMessage(`Board visibility updated successfully`);
    notiStore.setShowNotification(true);
    notiStore.setNotificationType("success");
  } catch (error) {
    notiStore.setNotificationMessage("There is a problem. Please try again later.")
    notiStore.setShowNotification(true);
    notiStore.setNotificationType("error");
    console.error(error);
  }
};
// Visibility Modal
const showModal = ref(false);
const openVisibilityModal = () => {
  showModal.value = true;
};
const confirmChange = async () => {
  showModal.value = false;
  await toggleVisibility();
};
</script>

<template>
  <header class="pt-8 flex justify-center">
    <h1
      class="itbkk-board-name mb-4 text-4xl text-center font-extrabold leading-none tracking-tight text-[rgb(51,56,145)] sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
      {{ loginStore.getName() }}<span class="text-gray-900 dark:text-white"> Personal Board</span></h1>
  </header>
  <Profile />
  <!-- Empty Table -->
  <div v-if="tasks.length === 0" class="pt-8">
    <div class="flex justify-center w-auto">
      <Notification class="mb-2" :message="notiStore.notificationMessage" v-if="notiStore.showNotification" />
    </div>
    <div class="flex justify-center">
      <div class="max-h-screen flex justify-center">
        <div class="flex items-start pt-8">
          <button @click="router.push({ name: 'AddBoardTask' })" class="itbkk-button-add">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
              class="w-[3rem] h-[3rem] rounded-md bg-[#c5daff] fill-[#00215E] hover:scale-125 duration-150">
              <path
                d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
            </svg>
          </button>
        </div>
        <div class="w-full max-w-screen-lg pl-2">
          <div class="flex justify-between pb-2 gap-4">
            <div class="flex gap-4">
              <RouterLink :to="{ name: 'Board' }">
                <button
                  class="itbkk-home bg-slate-100 px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-200 text-black hover:bg-green-400 hover:text-[#f0f0f0]">Home</button>
              </RouterLink>
              <RouterLink :to="{ name: 'StatusBoard' }">
                <button
                  class="itbkk-manage-status bg-[#4d8cfa] px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-150 text-white hover:bg-[#0062ff] hover:text-[#f0f0f0]">Manage
                  Status</button>
              </RouterLink>
            </div>
            <div class="flex gap-3">
              <label class="inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" :checked="isPublic" @click.prevent="openVisibilityModal">
                <span class="me-2 text-sm font-bold text-gray-900 dark:text-gray-300">PRIVATE</span>
                <div
                  class="itbkk-board-visibility relative w-11 h-6 bg-gray-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                </div>
                <span class="ms-2 text-sm font-bold text-gray-900 dark:text-gray-300">PUBLIC</span>
              </label>
              <!-- Confirmation Modal Component -->
              <VisibilityModal :show="showModal" title="Confirm Visibility Change"
                :message="`${isPublic ? 'PRIVATE' : 'PUBLIC'}`" @confirm="confirmChange" @close="showModal = false" />
              <div class="dropdown">
                <button @click="openCheckbox" id="dropdownBgHoverButton" data-dropdown-toggle="dropdownBgHover"
                  class="text-blue-700 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-white dark:hover:bg-gray-200 dark:focus:ring-gray-400"
                  type="button">
                  Filter
                  <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 10 6">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="m1 1 4 4 4-4" />
                  </svg>
                </button>
                <!-- Dropdown menu -->
                <div v-if="checkBox" id="dropdownBgHover"
                  class="absolute z-30 w-48 bg-white rounded-lg shadow dark:bg-gray-700 mt-2">
                  <!-- Adjust the position here to make it relative to the button -->
                  <ul class="dropdown-bottom p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200"
                    aria-labelledby="dropdownBgHoverButton">
                    <li v-for="status in statuses" :key="status.id">
                      <div class="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                        <input :id="`checkbox-item-${status.id}`" type="checkbox" :value="status.name"
                          v-model="selectedStatuses"
                          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                        <label :for="`checkbox-item-${status.id}`"
                          class="truncate w-full ms-2 text-sm font-medium text-gray-900 rounded dark:text-gray-300">
                          {{ status.name }}
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="relative max-h-[26.5em] bg-[rgba(0,0,0,0.5)] overflow-x-auto hide shadow-md sm:rounded-lg">
            <table class="w-full text-sm text-left rtl:text-right table-fixed text-black">
              <thead class="text-lg uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                <tr class="text-black">
                  <th class="px-6 py-3 w-[1%] text-center">Id</th>
                  <th class="px-6 py-3 w-[5%] text-center">Title</th>
                  <th class="px-6 py-3 w-[5%] text-center">Assignees</th>
                  <th class="px-6 py-3 w-[5%] text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr class="itbkk-item text-[1.5em]">
                  <td
                    class="text-center font-bold py-6 px-4 bg-gradient-to-r from-pink-200 via-pink-400 to-rose-400 text-white shadow-md uppercase tracking-wide"
                    colspan="4">No Task</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Table with Tasks -->
  <div v-else class="pt-8">
    <div class="flex justify-center w-auto">
      <Notification class="mb-2" :message="notiStore.notificationMessage" v-if="notiStore.showNotification" />
    </div>
    <div class="flex justify-center">
      <div class="max-h-screen flex justify-center">
        <div class="flex items-start pt-8">
          <button @click="router.push({ name: 'AddBoardTask' })" class="itbkk-button-add disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!hasPermission">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
              class="w-[3rem] h-[3rem] rounded-md bg-[#c5daff] fill-[#00215E] hover:scale-125 duration-150">
              <path
                d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
            </svg>
          </button>
        </div>
        <div class="w-full max-w-screen-lg pl-2">
          <div class="flex justify-between pb-2 gap-4">
            <div class="flex gap-4">
              <RouterLink :to="{ name: 'Board' }">
                <button
                  class="itbkk-home bg-slate-100 px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-200 text-black hover:bg-green-400 hover:text-[#f0f0f0]">Home</button>
              </RouterLink>
              <RouterLink :to="{ name: 'StatusBoard' }">
                <button
                  class="itbkk-manage-status bg-[#4d8cfa] px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-150 text-white hover:bg-[#0062ff] hover:text-[#f0f0f0]">Manage
                  Status</button>
              </RouterLink>
            </div>
            <div class="flex gap-3">
              <label class="inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" :checked="isPublic" @click.prevent="openVisibilityModal">
                <span class="me-2 text-sm font-bold text-gray-900 dark:text-gray-300">PRIVATE</span>
                <div
                  class="itbkk-board-visibility relative w-11 h-6 bg-gray-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                </div>
                <span class="ms-2 text-sm font-bold text-gray-900 dark:text-gray-300">PUBLIC</span>
              </label>
              <!-- Confirmation Modal Component -->
              <VisibilityModal :show="showModal" title="Confirm Visibility Change"
                :message="`${isPublic ? 'PRIVATE' : 'PUBLIC'}`" @confirm="confirmChange" @close="showModal = false" />
              <div class="dropdown">
                <button @click="openCheckbox" id="dropdownBgHoverButton" data-dropdown-toggle="dropdownBgHover"
                  class="text-blue-700 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-white dark:hover:bg-gray-200 dark:focus:ring-gray-400"
                  type="button">
                  Filter
                  <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 10 6">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="m1 1 4 4 4-4" />
                  </svg>
                </button>
                <!-- Dropdown menu -->
                <div v-if="checkBox" id="dropdownBgHover"
                  class="absolute z-30 w-48 bg-white rounded-lg shadow dark:bg-gray-700 mt-2">
                  <!-- Adjust the position here to make it relative to the button -->
                  <ul class="dropdown-bottom p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200"
                    aria-labelledby="dropdownBgHoverButton">
                    <li v-for="status in statuses" :key="status.id">
                      <div class="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                        <input :id="`checkbox-item-${status.id}`" type="checkbox" :value="status.name"
                          v-model="selectedStatuses"
                          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                        <label :for="`checkbox-item-${status.id}`"
                          class="truncate w-full ms-2 text-sm font-medium text-gray-900 rounded dark:text-gray-300">
                          {{ status.name }}
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="relative max-h-[26.5em] bg-[rgba(0,0,0,0.5)] overflow-x-auto hide shadow-md sm:rounded-lg">
            <table class="w-full text-sm text-left rtl:text-right table-fixed text-black">
              <thead class="text-lg uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                <tr>
                  <th class="px-6 py-3 w-[4%] text-center">Id</th>
                  <th class="px-6 py-3 w-[3%]"></th>
                  <th class="px-6 py-3 w-1/4 text-center">Title</th>
                  <th class="px-6 py-3 w-1/4 text-center">Assignees</th>
                  <th class="px-6 py-3 w-1/6 text-center">
                    <div class="flex items-center justify-center">
                      Status
                      <button @click="cycleSortOrder">
                        <svg v-if="sortOrder === 'asc'" xmlns="http://www.w3.org/2000/svg" width="2em" height="2em"
                          viewBox="0 0 24 24">
                          <path fill="currentColor"
                            d="M10.22 15.97L9 17.19V5c0-.41-.34-.75-.75-.75s-.75.34-.75.75v12.19l-1.22-1.22c-.29-.29-.77-.29-1.06 0s-.29.77 0 1.06l2.5 2.5a.78.78 0 0 0 .53.22a.78.78 0 0 0 .53-.22l2.5-2.5c.29-.29.29-.77 0-1.06s-.77-.29-1.06 0M14 11.21c.39.14.82-.06.96-.45l.28-.78h2.03l.28.78c.11.31.4.5.71.5c.08 0 .17-.01.25-.04a.75.75 0 0 0 .45-.96l-1.71-4.79c-.17-.43-.56-.71-1-.71s-.83.28-1 .73l-1.7 4.77c-.14.39.06.82.45.96Zm2.73-2.73h-.96l.48-1.34zm1.94 4.98c-.19-.44-.59-.71-1.05-.71h-3.11c-.41 0-.75.34-.75.75s.34.75.75.75h2.39l-2.83 2.95c-.34.36-.43.88-.24 1.34c.19.44.59.71 1.05.71h3.13c.41 0 .75-.34.75-.75s-.34-.75-.75-.75h-2.39l2.82-2.93c.34-.36.44-.89.24-1.35Z" />
                        </svg>
                        <svg v-if="sortOrder === 'desc'" xmlns="http://www.w3.org/2000/svg" width="2em" height="2em"
                          viewBox="0 0 24 24">
                          <path fill="currentColor"
                            d="M8.78 4.47a.8.8 0 0 0-.24-.16a.7.7 0 0 0-.57 0c-.09.04-.17.09-.24.16l-2.5 2.5c-.29.29-.29.77 0 1.06s.77.29 1.06 0l1.22-1.22V19c0 .41.34.75.75.75s.75-.34.75-.75V6.81l1.22 1.22c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.5-2.5ZM14 11.21c.39.14.82-.06.96-.45l.28-.78h2.03l.28.78c.11.31.4.5.71.5c.08 0 .17-.01.25-.04a.75.75 0 0 0 .45-.96l-1.71-4.79c-.17-.43-.56-.71-1-.71s-.83.28-1 .73l-1.7 4.77c-.14.39.06.82.45.96Zm2.73-2.73h-.96l.48-1.34zm1.94 4.98c-.19-.44-.59-.71-1.05-.71h-3.11c-.41 0-.75.34-.75.75s.34.75.75.75h2.39l-2.83 2.95c-.34.36-.43.88-.24 1.34c.19.44.59.71 1.05.71h3.13c.41 0 .75-.34.75-.75s-.34-.75-.75-.75h-2.39l2.82-2.93c.34-.36.44-.89.24-1.35Z" />
                        </svg>
                        <svg v-if="sortOrder === 'none'" xmlns="http://www.w3.org/2000/svg" opacity="60%" width="2em"
                          height="1.5em" viewBox="0 0 320 512">
                          <path fill="currentColor"
                            d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41m255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41" />
                        </svg>
                      </button>
                    </div>
                  </th>
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
                        <li><button @click="router.push({ name: 'EditBoardTask', params: { task: task.id } })"
                            class="itbkk-button-edit hover:bg-red-200">Edit</button></li>
                        <li><button @click="openConfirmModal(task)"
                            class="itbkk-button-delete hover:bg-red-200">Delete</button>
                        </li>
                      </ul>
                    </button>
                  </td>
                  <td class="text-center">
                    <button
                      class="itbkk-title max-w-[12rem] truncate cursor-pointer hover:no-underline hover:bg-blue-100 rounded-lg hover:text-blue-600 transition ease-in-out duration-300"
                      @click="router.push({ name: 'TaskModal', params: { task: task.id } })">{{ task.title }}</button>
                  </td>
                  <td class="itbkk-assignees italic text-gray-500 text-center" v-if="!task.assignees">Unassigned</td>
                  <td class="itbkk-assignees italic text-center" v-else.trim>{{ task.assignees }}</td>
                  <td class="itbkk-status text-center">{{ task.status.name ? task.status.name : task.status }}</td>
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
        <button @click="deleteTask(taskToDelete.id)" :disabled="!hasPermission"
          class="itbkk-button-confirm p-4 rounded-lg bg-green-600 hover:bg-green-500 border-0 mr-4 flex-grow hover:scale-105 duration-150 text-white disabled:cursor-not-allowed disabled:opacity-50">Confirm</button>
        <button
          class="itbkk-button-cancel p-4 rounded-lg bg-red-500 hover:bg-red-600 border-0 flex-grow hover:scale-105 duration-200 text-white"
          @click="closeConfirmModal">Cancel</button>
      </div>
      <p v-if="!hasPermission" class="text-red-400 text-[14px] text-center mt-2">You need to be board owner to perform this action.</p>
    </div>
  </div>
  <RouterView />
</template>

<style scoped></style>