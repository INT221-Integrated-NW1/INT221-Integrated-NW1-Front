import { ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useBoardStore = defineStore("boardStore", () => {
	const boards = ref([
		{
			personal: [],
			collab: [],
		}
	]);

	const getBoards = () => {
		return boards;
	};
	const addBoard = (newBoard) => {
		boards.value?.push(newBoard);
	};
	const addCollaborator = (collaborator) => {
		boards.value.collab.push(collaborator);
	};
	const removeCollaborator = (collaboratorId) => {
		const index = boards.value.collab.findIndex(
			(collaborator) => collaborator.oid === collaboratorId
		);
		if (index !== -1) {
			boards.value.collab.splice(index, 1);
		}
	};
	const leaveBoard = (collaboratorId) => {
		boards.value.collab = boards.value.collab.filter(board => board.id !== collaboratorId);
	};
	const updateAccessRight = (updatedCollaborator) => {
		const index = boards.value.collab.findIndex(
			(collaborator) => collaborator.oid === updatedCollaborator.oid
		);
		if (index !== -1) {
			boards.value.collab[index].accessRight = updatedCollaborator.accessRight;
		} else {
			console.error("Collaborator not found!");
		}
	};
	const resetBoards = () => {
		boards.value = [];
	};
	const findBoards = (searchId) => {
		boards.value.find((board) => board.id === searchId);
	};
	const findIndexBoards = (searchId) => {
		boards.value.findIndex((board) => board.id === searchId);
	};
	const removeBoards = (removeId) => {
		boards.value.splice(
			boards.value.findIndex((board) => board.id === removeId),
			1
		);
	};
	const setBoards = (newBoards) => {
		boards.value.personal = newBoards.personal || [];
		boards.value.collab = newBoards.collab || [];
	};
	return {
		getBoards,
		addBoard,
		addCollaborator,
		removeCollaborator,
		updateAccessRight,
		resetBoards,
		findBoards,
		findIndexBoards,
		removeBoards,
		leaveBoard,
		setBoards,
	};
});
if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useBoardStore, import.meta.hot));
}
