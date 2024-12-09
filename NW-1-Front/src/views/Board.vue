<script setup>
import { onMounted, ref, watchEffect } from "vue";
import Notification from "../components/Notification.vue";
import AddBoard from "../components/AddBoard.vue"
import Profile from "../components/Profile.vue";
import { deleteItem, getItemsRes } from "../libs/fetchUtils.js"
import { useRouter, useRoute } from "vue-router";
import { useNotiStore } from '../stores/notificationStore.js';
import { useLoginStore } from '../stores/loginStore.js';
import { useBoardStore } from '../stores/boardStore.js';
import 'animate.css';
import CollabModal from "@/components/CollabModal.vue";

const route = useRoute();
const router = useRouter()
const boardStore = useBoardStore();
const boards = boardStore.getBoards();
const notiStore = useNotiStore();
const loginStore = useLoginStore();
const ownerId = ref(null)
ownerId.value = loginStore.getUserId()

const getAllBoards = async () => {
    try {
        const { data, status } = await getItemsRes(`${import.meta.env.VITE_BASE_URL}/v3/boards`, loginStore.getToken());
        const personalBoards = (data.personal_BOARD || []).sort((a, b) => new Date(a.created_on) - new Date(b.created_on));
        const collabBoards = (data.collaborate_BOARD || []).sort((a, b) => new Date(a.addedOn) - new Date(b.addedOn));
        boardStore.setBoards({
            personal: personalBoards,
            collab: collabBoards
        });
        if (personalBoards.length === 1 && collabBoards.length === 0) {
            router.push({ name: 'TaskBoard', params: { id: personalBoards[0].id } });
        }
        if (status === 401) {
            await getAllBoards()
        }
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
};

onMounted(() => {
    getAllBoards();
});

const showModal = ref(false);
const openModal = () => {
    showModal.value = true;
    router.push({ name: 'AddBoard' });
};

const closeModal = () => {
    showModal.value = false;
    router.push({ name: 'Board' });
};

// ตรวจจับการเปลี่ยนเส้นทางและจัดการ modal
watchEffect(() => {
    if (route.name === 'AddBoard') {
        showModal.value = true;
    } else {
        showModal.value = false;
    }
});

const isLeaveModal = ref(false);
const modalTitle = ref("");
const modalMessage = ref("");
const removeBoardName = ref("");
const boardId = ref(null)

const openLeaveModal = (title, message, board, boardName) => {
    modalTitle.value = title;
    modalMessage.value = message;
    boardId.value = board;
    removeBoardName.value = boardName
    isLeaveModal.value = true
}

const closeLeaveModal = () => {
    isLeaveModal.value = false
}

const leaveBoard = async () => {
    try {
        const { response, status } = await deleteItem(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId.value}/collabs/${ownerId.value}`, loginStore.getToken());
        if (status === 200) {
            boardStore.leaveBoard(boardId.value)
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("success")
            notiStore.setNotificationMessage(`Remove "${removeBoardName.value}" Success`)
            closeLeaveModal()
        } else if (status === 401) {
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("error")
            notiStore.setNotificationMessage("Refreshing the token.")
        } else {
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("error")
            notiStore.setNotificationMessage("There is a problem. Please try again later.")
            closeLeaveModal()
        }
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
}
</script>

<template>
    <Profile />
    <div>
        <!-- Empty Table -->
        <div v-if="boards?.length === 0" class="pt-8">
            <div class="flex justify-center w-auto">
                <Notification :message="notiStore.notificationMessage" v-if="notiStore.showNotification" />
            </div>
            <div class="flex justify-center">
                <div class="max-h-screen flex justify-center">
                    <div class="w-full max-w-screen-lg">
                        <div class="flex justify-between pb-2 gap-4">
                            <button @click="openModal"
                                class="itbkk-button-create bg-[#4d8cfa] px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-150 text-white hover:bg-[#0062ff] hover:text-[#f0f0f0]">
                                Create Board</button>
                            <AddBoard v-if="showModal" @close="closeModal" />
                        </div>
                        <div
                            class="relative max-h-[26.5em] bg-[rgba(0,0,0,0.5)] overflow-x-auto hide shadow-md sm:rounded-lg">
                            <table class="w-full text-sm text-left rtl:text-right table-fixed">
                                <thead class="text-lg uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                    <tr class="text-black">
                                        <th class="px-6 py-3 w-[10%] text-center">No</th>
                                        <th class="px-6 py-3 pl-48 w-[50%] text-center">Name</th>
                                        <th class="px-6 py-3 w-1/4 text-center">Visibility</th>
                                    </tr>
                                </thead>
                                <tbody class="font-semibold">
                                    <tr
                                        class="itbkk-item text-[1.2em] odd:bg-white odd:dark:bg-gray-900 even:bg-slate-100 even:dark:bg-gray-800">
                                        <td class="itbkk-assignees text-center py-6 px-4 bg-gradient-to-r from-pink-200 via-pink-400 to-rose-400 text-white shadow-md uppercase tracking-wide"
                                            colspan="3">
                                            No Board
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Personal Boards -->
        <div class="pt-8">
            <header class="flex justify-center">
                <h1
                    class="mb-4 text-center font-extrabold leading-none tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
                    Personal Boards</h1>
            </header>
            <div class="flex justify-center w-auto">
                <Notification :message="notiStore.notificationMessage" v-if="notiStore.showNotification" />
            </div>
            <div class="flex justify-center">
                <div class="max-h-screen flex justify-center">
                    <div class="w-full max-w-screen-lg">
                        <div class="flex justify-between pb-2 gap-4">
                            <button @click="openModal"
                                class="itbkk-button-create bg-[#4d8cfa] px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-150 text-white hover:bg-[#0062ff] hover:text-[#f0f0f0]">
                                Create Board</button>
                            <AddBoard v-if="showModal" @close="closeModal" />
                        </div>
                        <div
                            class="relative max-h-[120px] bg-[rgba(255,125,168)] overflow-x-auto hide shadow-md sm:rounded-lg">
                            <table class="w-full text-sm text-left rtl:text-right table-fixed">
                                <thead class="text-lg uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                    <tr class="text-black">
                                        <th class="px-6 py-3 w-[10%] text-center">No</th>
                                        <th class="px-6 py-3 w-[50%] text-center">Name</th>
                                        <th class="px-6 py-3 w-1/4 text-center">Visibility</th>
                                    </tr>
                                </thead>
                                <tbody v-if="boards.personal?.length !== 0" class="font-semibold">
                                    <tr v-for="(board, index) in boards.personal" :key="index"
                                        class="itbkk-personal-item text-[1.2em] text-black odd:bg-white odd:dark:bg-gray-900 even:bg-slate-100 even:dark:bg-gray-800 transition hover:translate-x-4 duration-300 ease-in-out">
                                        <td class="text-center"> {{ index + 1 }} </td>
                                        <td @click="router.push({ name: 'TaskBoard', params: { id: board.id } })"
                                            class="itbkk-board-name text-center cursor-pointer"> {{ board.name }} </td>
                                        <td class="itbkk-board-visibility text-center px-6 py-4"> {{ board.visibility }}
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody v-else class="font-semibold">
                                    <tr
                                        class="itbkk-collab-item text-[1.2em] text-black odd:bg-white odd:dark:bg-gray-900 even:bg-slate-100 even:dark:bg-gray-800 transition hover:translate-x-2 duration-300 ease-in-out">
                                        <td colspan="3" class="text-center py-6 text-gray-500">No Board</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Collaborate Boards -->
        <div>
            <header class="pt-6 flex justify-center">
                <h1
                    class="mb-4 text-center font-extrabold leading-none tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
                    Collab Boards</h1>
            </header>
            <div class="flex justify-center">
                <div class="max-h-screen flex justify-center">
                    <div class="w-full max-w-screen-lg">
                        <div class="relative max-h-[15.5em] bg-[#7c88f8] overflow-x-hidden shadow-md sm:rounded-lg">
                            <table class="w-full text-sm text-left rtl:text-right table-fixed">
                                <thead class="text-md uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                    <tr class="text-black">
                                        <th class="px-6 py-3 w-[10%] text-center">No</th>
                                        <th class="px-6 py-3 w-[30%] text-center">Name</th>
                                        <th class="px-6 py-3 w-[30%] text-center">Owner</th>
                                        <th class="px-6 py-3 w-[15%] text-center">Access Right</th>
                                        <th class="px-6 py-3 w-[15%] text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody v-if="boards.collab?.length !== 0" class="font-semibold">
                                    <tr v-for="(board, index) in boards.collab" :key="index"
                                        class="itbkk-collab-item text-[1.2em] text-black odd:bg-white odd:dark:bg-gray-900 even:bg-slate-100 even:dark:bg-gray-800 transition hover:translate-x-4 duration-300 ease-in-out">
                                        <td class="text-center"> {{ index + 1 }} </td>
                                        <td @click="router.push({ name: 'TaskBoard', params: { id: board.id } })"
                                            class="itbkk-board-name text-center cursor-pointer"> {{ board.name }} </td>
                                        <td class="itbkk-owner-name text-center px-6 py-4"> {{ board.owner?.name }}</td>
                                        <td class="itbkk-access-right text-center px-6 py-4"> {{ board.accessRight }}
                                        </td>
                                        <td class="text-center px-6 py-4 flex justify-center">
                                            <button
                                                @click='openLeaveModal("Leave Board", `Do you want to leave "${board.name} board?"`, board.id, board.name)'
                                                class="itbkk-leave-board px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 rounded-lg">
                                                Leave
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody v-else class="font-semibold">
                                    <tr
                                        class="itbkk-collab-item text-[1.2em] text-black odd:bg-white odd:dark:bg-gray-900 even:bg-slate-100 even:dark:bg-gray-800 transition hover:translate-x-4 duration-300 ease-in-out">
                                        <td colspan="5" class="text-center py-6 text-gray-500">No Board</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <CollabModal :isOpen="isLeaveModal" :title="modalTitle" :message="modalMessage" @close="closeLeaveModal"
        @confirm="leaveBoard" />
</template>

<style scoped>
::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background-color: rgb(119, 115, 110);
}

::-webkit-scrollbar-thumb {
    background-color: rgb(255, 189, 211);
}

::-webkit-scrollbar-thumb:hover {
    background: #fca9d7;
}
</style>