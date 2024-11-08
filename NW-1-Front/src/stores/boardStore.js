import { ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useBoardStore = defineStore("boardStore", () => {
	const boards = ref([{
		personal: [],
		collab: [],
	}]);

	const getBoards = () => {
		return boards;
	};
	const addBoard = (newBoard) => {
		boards.value.push(newBoard);
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
	const editBoard = (newBoard) => {
		boards.value.forEach((board) => {
			if (board.id === newBoard.id) {
				board.title = newBoard.title;
				board.assignees = newBoard.assignees;
				board.status = newBoard.status;
			}
		});
	};
	return {
		getBoards,
		addBoard,
		resetBoards,
		findBoards,
		findIndexBoards,
		removeBoards,
		setBoards,
		editBoard,
	};
});
if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useBoardStore, import.meta.hot));
}
