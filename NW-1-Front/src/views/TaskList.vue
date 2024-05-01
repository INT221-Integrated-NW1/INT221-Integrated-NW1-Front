<script setup>
import { ref, onBeforeMount } from "vue";
import { getItems } from "../libs/fetchUtils.js"
import { useRouter, RouterView } from "vue-router";

const router = useRouter()

const tasks = ref([])

const getTasks = async () => {
  try {
    const data = await getItems(`${import.meta.env.VITE_BASE_URL}/v1/tasks`);
    tasks.value = data;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
  }
};
onBeforeMount(() => {
  getTasks();
});

const formatStatus = (status) => {
  return status.replace(/_/g, ' ');
};
</script>

<template>
  <header
    class="lobster-regular text-[#ed673e] head-shadow text-center mt-8 text-[4em] font-extrabold  bg-clip-text bg-gradient-to-r">
    <h1>
      IT-Bangmod Kradan Kanban
      <!-- Hex Codes: #2BAF90, #A1D4B1, #F1A512, #DD4111, #8C0027 -->
    </h1>
  </header>
  <div class="flex justify-end mr-40">
    <button class="text-xl" @click="router.push('/task/add')">Add</button>
  </div>
  <div v-if="tasks.length === 0" class="flex justify-center">
    <div
      class="overflow-x-auto border-[4px] border-slate-600 rounded-lg h-[28em] hide m-4 hover:shadow-[rgba(200,200,200,0.7)0_0px_100px_] transition-shadow">
      <table class="table table-zebra table-pin-rows text-center">
        <thead class="text-3xl">
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Assignees</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr class="itbkk-item text-[1.5em]">
            <td colspan="4">NO Task</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-else class="flex justify-center">
    <div
      class="overflow-x-auto border-[4px] border-slate-600 rounded-lg h-[28em] hide m-4 hover:shadow-[rgba(200,200,200,0.7)0_0px_100px_] transition-shadow">
      <table class="table table-zebra table-pin-rows text-center">
        <thead class="text-3xl">
          <tr class="bg-[#2BAF90]">
            <th>Id</th>
            <th></th>
            <th>Title</th>
            <th>Assignees</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr class="itbkk-item text-[1.2em]" v-for="task in tasks" :key="task.id">
            <td class="itbkk-id">{{ task.id }}</td>
            <td class="p-0">
              <button class="text-[1.8em] dropdown dropdown-right">
                <div tabindex="0" class="">⋮</div>
                <ul tabindex="0" class="dropdown-content z-10 menu mt-2 p-2 shadow bg-base-100 rounded-box w-52">
                  <li><a @click="router.push(`/task/${task.id}/edit`)">Edit</a></li>
                  <li><a @click="">Delete</a></li>
                </ul>
              </button>

            </td>
            <button>
              <td
                class="itbkk-title cursor-pointer hover:no-underline hover:bg-blue-100 rounded-lg hover:text-blue-600 transition ease-in-out duration-300"
                @click="router.push(`/task/${task.id}`)">{{ task.title.trim() }}</td>
            </button>
            <td class="itbkk-assignees italic text-gray-500" v-if="!task.assignees">Unassigned</td>
            <td class="itbkk-assignees italic" v-else.trim>{{ task.assignees }}</td>
            <td class="itbkk-status">{{ formatStatus(task.status) }}</td>
          </tr>
        </tbody>
      </table>
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
  filter: drop-shadow(#8C0027 4px 5px 0px)
}

/* Hex Codes: #2BAF90, #A1D4B1, #F1A512, #DD4111 , #ed673e, #8C0027*/
</style>