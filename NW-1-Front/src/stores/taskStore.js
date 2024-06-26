import { ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useTaskStore = defineStore("taskStore", () => {
	const tasks = ref([]);

	const getTasks = () => {
		return tasks;
	};
	const addTask = (newTask) => {
		tasks.value.push(newTask);
	};
	const resetTasks = () => {
		tasks.value = [];
	};
	const findTasks = (searchId) => {
		tasks.value.find((task) => task.id === searchId);
	};
	const findIndexTasks = (searchId) => {
		tasks.value.findIndex((task) => task.id === searchId);
	};
	const removeTasks = (removeId) => {
		tasks.value.splice(
			tasks.value.findIndex((task) => task.id === removeId),
			1
		);
	};
	const setTasks = (newTasks) => {
		tasks.value = newTasks;
	};
	const editTask = (newTask) => {
		tasks.value.forEach((task) => {
			if (task.id === newTask.id) {
				task.title = newTask.title;
				task.assignees = newTask.assignees;
				task.status = newTask.status;
			}
		});
	};
	return {
		getTasks,
		addTask,
		resetTasks,
		findTasks,
		findIndexTasks,
		removeTasks,
		setTasks,
		editTask,
	};
});
if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useTaskStore, import.meta.hot));
}
