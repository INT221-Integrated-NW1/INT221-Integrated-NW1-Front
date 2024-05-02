import { ref } from "vue";
// import { defineStore, acceptHMRUpdate } from "pinia";

// const useTaskStore = defineStore("taskStore", () => {
// 	const tasks = ref([]);
// 	return {
// 		tasks,
// 	};
// });
// export { useTaskStore };

// if (import.meta.hot) {
// 	import.meta.hot.accept(acceptHMRUpdate(useTaskStore, import.meta.hot));
// }

const tasks = ref([]);

export { tasks };