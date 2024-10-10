<script setup>
import { ref } from 'vue';
import { useBoardStore } from '../stores/boardStore.js';
import { useLoginStore } from '../stores/loginStore.js';
import { useRouter } from "vue-router";
import { addItem } from '../libs/fetchUtils.js';

const router = useRouter();
const boardStore = useBoardStore();
const loginStore = useLoginStore();
const showModal = ref(true);
const board = ref({ name: "" });
const boardExists = ref(boardStore.getBoards().value.length > 0);

const createBoard = async () => {
    if (!board.value) {
        alert('Please enter a board name');
        return;
    }
    if (boardStore.getBoards().value.length > 0) {
        alert('You can only create one board.');
        return;
    }
    const newBoard = await addItem(`${import.meta.env.VITE_BASE_URL}/v3/boards`, board.value, loginStore.getToken());
    if (!newBoard.status === 201) {
        throw new Error("Failed to add status");
    }
    boardStore.addBoard(newBoard);
    boardExists.value = true;
    closeModal();
    router.push({ name: 'Board' })
};

const closeModal = () => {
    board.value = '';
    showModal.value = false;
    router.push({ name: 'Board' })
};
</script>

<template>
    <transition name="fade">
        <div v-if="showModal" class="fixed inset-0 z-50 overflow-auto bg-smoke-light flex">
            <div class="itbkk-modal-new relative p-6 bg-white w-full max-w-md m-auto flex-col flex rounded-lg">
                <button @click="closeModal"
                    class="itbkk-button-cancel btn btn-md btn-circle btn-ghost absolute right-2 top-[10px] hover:bg-slate-200">X</button>
                <h2 class="text-xl text-black font-bold mb-4">Create New Board</h2>
                <form class="text-black">
                    <div class="mb-4">
                        <label for="name" class="block text-sm font-bold mb-2">Board Name</label>
                        <input v-model="board.name" type="text" id="name" maxlength="200"
                            class="itbkk-board-name w-full px-3 py-2 border rounded-lg" required />
                    </div>
                    <div class="flex justify-end">
                        <button type="button" @click="createBoard" :disabled="!board.name || boardExists"
                            class="itbkk-button-ok bg-green-500 text-white font-bold px-8 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">Create</button>
                    </div>
                </form>
                <p v-if="boardExists" class="text-red-500 mt-2 text-center">
                    You can only create one board.
                </p>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.bg-smoke-light {
    background-color: rgba(0, 0, 0, 0.5);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
}
</style>