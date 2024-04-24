<script setup>
import { ref, onBeforeMount } from "vue";
import { getItems } from "../libs/fetchUtils.js"

const tasks = ref(null)

const getTasks = async () => {
    try {
        // เรียกข้อมูลจาก API โดยใช้ fetch
        const data = await getItems(`http://localhost:8080/v1/tasks`);
        tasks.value = data;
    } catch (error) {
        // จัดการข้อผิดพลาดที่อาจเกิดขึ้น
        console.error('Failed to fetch tasks:', error);
    }
};

onBeforeMount(() => {
  getTasks();
});
</script>

<template>
  <input type="checkbox" value="valentine" class="toggle theme-controller m-2 absolute top-0 right-0" />
  <div class="flex justify-center mt-10">
    <div class="overflow-x-auto">
      <table class="table table-zebra text-center">
        <!-- head -->
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Assignees</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in tasks" :key="task.id">
            <td>{{ task.id }}</td>
            <td>{{ task.title }}</td>
            <td>{{ task.assignees }}</td>
            <td>{{ task.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
