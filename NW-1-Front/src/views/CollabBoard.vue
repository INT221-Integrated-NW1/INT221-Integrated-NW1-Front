<script setup>
import Notification from "../components/Notification.vue";
import Profile from "../components/Profile.vue";
import { useRouter, useRoute } from "vue-router";
import { useNotiStore } from '../stores/notificationStore.js';
import { useLoginStore } from '../stores/loginStore.js';
import { useBoardStore } from "@/stores/boardStore";
import { getItemsRes } from "@/libs/fetchUtils";
import { onMounted } from "vue";

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
        boards.value.collab = data
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
};

onMounted(() => {
    getCollaborateBoards();
});
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
                                    <td class="itbkk-board-name text-center"> {{ board.name }} </td>
                                    <td class="itbkk-owner-name text-center px-6 py-4"> {{ board.email }}</td>
                                    <td class="itbkk-access-right text-center px-6 py-4"> {{ board.accessRight }}
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
</template>

<style scoped></style>