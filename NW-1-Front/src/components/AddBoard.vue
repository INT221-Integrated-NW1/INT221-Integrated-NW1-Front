<script setup>
import { ref  } from 'vue';
import { useBoardStore } from '../stores/boardStore.js';
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const boardStore = useBoardStore();
const showModal = ref(true);
const boardName = ref('');

const createBoard = () => {
    if (!boardName.value) {
        alert('Please enter a board name');
        return;
    }
    boardStore.addBoard(boardName.value);
    closeModal();
    router.push({ name: 'Board' })
};

const closeModal = () => {
    boardName.value = '';
    showModal.value = false;
    router.push({ name: 'Board' })
};
</script>

<template>
    <transition name="fade">
        <div v-if="showModal" class="fixed inset-0 z-50 overflow-auto bg-smoke-light flex">
            <div class="relative p-6 bg-white w-full max-w-md m-auto flex-col flex rounded-lg">
                <button @click="closeModal"
                    class="btn btn-md btn-circle btn-ghost absolute right-2 top-[10px] hover:bg-slate-200">X</button>
                <h2 class="text-xl font-bold mb-4">Create New Board</h2>
                <form>
                    <div class="mb-4">
                        <label for="board_name" class="block text-sm font-bold mb-2">Board Name</label>
                        <input v-model="boardName" type="text" id="board_name"
                            class="w-full px-3 py-2 border rounded-lg" required />
                    </div>
                    <div class="flex justify-end">
                        <button type="button" @click="createBoard"
                            class="bg-green-500 text-white font-bold px-8 py-2 rounded hover:bg-green-700">Create</button>
                    </div>
                </form>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.bg-smoke-light {
    background-color: rgba(0, 0, 0, 0.5);
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s ease;  
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;  
}

.fade-enter-to, .fade-leave-from {
    opacity: 1;  
}
</style>