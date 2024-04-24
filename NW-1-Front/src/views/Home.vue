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
</script>

<template>
  <input type="checkbox" value="dracula" class="toggle theme-controller m-2 absolute top-0 right-0"/>
  <div class="flex justify-center mt-10">
    <div class="overflow-x-auto border-8 border-slate-600 rounded-2xl h-[24em] hide m-4 shadow-2xl">
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
            <td class="itbkk-title">{{ task.title }}</td>
            <td class="itbkk-assignees">{{ task.assignees }}</td>
            <td class="itbkk-status">{{ task.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.hide::-webkit-scrollbar {
  display: none;
}
</style>