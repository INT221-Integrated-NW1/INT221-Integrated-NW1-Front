import { ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useStatusStore = defineStore("statusStore", () => {
	const statuses = ref([]);

	const getStatuses = () => {
		return statuses;
	};
	const addStatus = (newStatus) => {
		statuses.value.push(newStatus);
	};
	const resetStatuses = () => {
		statuses.value = [];
	};
	const findStatuses = (searchId) => {
		statuses.value.find((status) => status.id === searchId);
	};
	const findIndexStatuses = (searchId) => {
		statuses.value.findIndex((status) => status.id === searchId);
	};
	const removeStatuses = (removeId) => {
		statuses.value.splice(
			statuses.value.findIndex((status) => status.id === removeId),
			1
		);
	};
	const setStatuses = (newStatuses) => {
		statuses.value = newStatuses;
	};
	const editStatus = (newStatus) => {
		statuses.value.forEach((status) => {
			if (status.id === newStatus.id) {
				status.title = newStatus.title;
				status.assignees = newStatus.assignees;
				status.status = newStatus.status;
			}
		});
	};
	return {
		getStatuses,
		addStatus,
		resetStatuses,
		findStatuses,
		findIndexStatuses,
		removeStatuses,
		setStatuses,
		editStatus,
	};
});
if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useStatusStore, import.meta.hot));
}
