<script setup>
import Notification from "../components/Notification.vue";
import Profile from "../components/Profile.vue";
import { useRouter, useRoute } from "vue-router";
import { useNotiStore } from '../stores/notificationStore.js';
import { useLoginStore } from '../stores/loginStore.js';
import { useBoardStore } from "@/stores/boardStore";
import { addItem, getItemsRes } from "@/libs/fetchUtils";
import { onMounted, ref } from "vue";

const notiStore = useNotiStore();
const loginStore = useLoginStore();
const boardStore = useBoardStore();
const boards = boardStore.getBoards()

const router = useRouter()
const route = useRoute();
const boardId = route.params.id

const getCollaborateBoards = async () => {
    try {
        const { data, status } = await getItemsRes(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/collabs`, loginStore.getToken());
        const sortedData = data.sort((a, b) => new Date(a.addedOn) - new Date(b.addedOn));
        boardStore.setBoards({ collab: sortedData });
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
};

const addCollab = ref({ email: "", accessRight: "" })
const addCollaborator = async () => {
    try {
        const { addedData, status } = await addItem(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/collabs`, addCollab.value, loginStore.getToken());
        boardStore.addCollaborator(addedData);
        closeModal()
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
};

onMounted(() => {
    getCollaborateBoards();
});

const showModal = ref(false);
const openModal = () => {
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    addCollab.value = { email: "", accessRight: "" }
};
</script>

<template>
    <div>
        <Profile />
        <header class="pt-14 flex justify-center">
            <h1
                class="mb-4 text-center font-extrabold leading-none tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
                Collaborator Management</h1>
        </header>
        <div class="flex justify-center w-auto">
            <Notification :message="notiStore.notificationMessage" v-if="notiStore.showNotification" />
        </div>
        <div class="flex justify-center mt-4">
            <div class="max-h-screen flex justify-center">
                <div class="w-full max-w-screen-lg">
                    <div class="flex gap-4 justify-between items-center mb-2">
                        <p class="itbkk-board-name text-black">{{ loginStore.getName() }} personal board > <span
                                class="font-semibold">Collaborator</span></p>
                        <button @click="openModal"
                            class="itbkk-manage-status bg-[#28a745] px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-150 text-white hover:bg-[#218838] hover:text-[#f0f0f0] focus:bg-[#1e7e34]">Add
                            Collaborator
                        </button>
                    </div>
                    <div class="relative max-h-[25.3em] bg-[#c971fc] overflow-x-hidden shadow-md sm:rounded-lg">
                        <table class="w-full text-sm text-left rtl:text-right table-fixed">
                            <thead class="text-md uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                <tr class="text-black">
                                    <th class="px-6 py-3 w-[10%] text-center">No</th>
                                    <th class="px-6 py-3 w-[30%] text-center">Name</th>
                                    <th class="px-6 py-3 w-[30%] text-center">Email</th>
                                    <th class="px-6 py-3 w-[15%] text-center">Access Right</th>
                                    <th class="px-6 py-3 w-[15%] text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody v-if="boards.collab?.length !== 0" class="font-semibold">
                                <tr v-for="(board, index) in boards.collab" :key="board.id"
                                    class="itbkk-collab-item text-[1.2em] text-black odd:bg-white odd:dark:bg-gray-900 even:bg-slate-100 even:dark:bg-gray-800 transition hover:translate-x-4 duration-300 ease-in-out">
                                    <td class="text-center"> {{ index + 1 }} </td>
                                    <td class="itbkk-board-name text-center"> {{ board.name ? board.name :
                                        board.collaboratorName }} </td>
                                    <td class="itbkk-owner-name text-center px-6 py-4"> {{ board.email ? board.email :
                                        board.collaboratorEmail }}</td>
                                    <td class="itbkk-access-right text-center px-6 py-4"> {{ board.accessRight ?
                                        board.accessRight : board.permission }}
                                    </td>
                                    <td class="text-center px-6 py-4 flex justify-center">
                                        <button
                                            class="itbkk-leave-board px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 rounded-lg">
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                            <tbody v-else class="font-semibold">
                                <tr
                                    class="itbkk-collab-item text-[1.2em] text-black odd:bg-white odd:dark:bg-gray-900 even:bg-slate-100 even:dark:bg-gray-800 transition hover:translate-x-4 duration-300 ease-in-out">
                                    <td colspan="5" class="text-center py-6 text-gray-500">No Collaborator</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <transition name="fade">
        <div v-if="showModal" class="fixed inset-0 z-50 overflow-auto bg-smoke-light flex">
            <form @submit.prevent
                class="itbkk-modal-new relative p-6 bg-white w-full max-w-md m-auto flex-col flex rounded-lg">
                <h2 class="text-xl text-black font-bold mb-4">Add Collaborator</h2>
                <div class="mb-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div class="sm:col-span-4">
                        <label for="collaboratorEmail" class="block text-sm/6 font-medium text-gray-900">Collaborator
                            E-mail</label>
                        <div class="">
                            <input v-model="addCollab.email" type="email" id="collaboratorEmail" required maxlength="50"
                                class="itbkk-collaborator-email block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6" />
                        </div>
                    </div>
                    <div class="sm:col-span-2">
                        <label for="accessRight" class="block text-sm/6 font-medium text-gray-900">Access Right
                        </label>
                        <div class="itbkk-access-right">
                            <select v-model="addCollab.accessRight" id="accessRight"
                                class="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
                                <option value="READ">READ</option>
                                <!-- <option value="WRITE">Write</option>
                                <option value="ADMIN">Admin</option> -->
                            </select>
                        </div>
                    </div>
                </div>
                <div class="flex justify-center">
                    <button
                        class="itbkk-button-confirm btn bg-green-600 hover:bg-green-500 border-0 mr-4 flex-grow hover:scale-105 duration-150 text-white"
                        @click="addCollaborator">Add</button>
                    <button
                        class="itbkk-button-cancel btn bg-red-500 hover:bg-red-600 border-0 flex-grow hover:scale-105 duration-200 text-white"
                        @click="closeModal">Cancel</button>
                </div>
            </form>
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