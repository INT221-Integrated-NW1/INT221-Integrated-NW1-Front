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
</script>

<template>
  <header
    class="text-center mt-8 text-[4em] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
    <h1>
      IT-Bangmod Kradan Kanban
    </h1>
  </header>
  <div class="flex justify-center mt-5">
    <div
      class="overflow-x-auto border-[6px] border-slate-600 rounded-2xl h-[28em] hide m-4 hover:shadow-[rgba(200,200,200,0.7)0_0px_100px_] transition-shadow">
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
          <tr class="itbkk-item text-[1.2em]" v-for="task in tasks" :key="task.task_id">
            <td class="itbkk-id">{{ task.task_id }}</td>
            <button>
              <td
                class="itbkk-title cursor-pointer hover:underline hover:bg-blue-100 rounded-lg hover:text-blue-600 transition ease-in-out duration-300"
                @click="router.push(`/task/${task.task_id}`)">{{ task.task_title }}</td>
            </button>
            <td class="itbkk-assignees italic" v-if="!task.task_assignees">Unassigned</td>
            <td class="itbkk-assignees italic" v-else>{{ task.task_assignees }}</td>
            <td class="itbkk-status">{{ task.task_status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
    <RouterView />
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