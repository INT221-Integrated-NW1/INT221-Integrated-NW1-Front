<script setup>
import Notification from "../components/Notification.vue";
import CollabModal from "@/components/CollabModal.vue";
import Profile from "../components/Profile.vue";
import { useRoute } from "vue-router";
import { useNotiStore } from '../stores/notificationStore.js';
import { useLoginStore } from '../stores/loginStore.js';
import { useBoardStore } from "@/stores/boardStore";
import { addItem, deleteItem, getItemsRes, updateAccessRight } from "@/libs/fetchUtils";
import { computed, onBeforeMount, onMounted, ref } from "vue";

const notiStore = useNotiStore();
const loginStore = useLoginStore();
const boardStore = useBoardStore();
const boards = boardStore.getBoards()

const route = useRoute();
const boardId = route.params.id

const boardOwnerId = ref(null);
const boardOwnerName = ref("")
const getBoardId = async () => {
    try {
        const { data } = await getItemsRes(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}`, loginStore.getToken());
        boards.value = data;
        boardOwnerId.value = data.user.oid
        boardOwnerName.value = data.user.username
    } catch (error) {
        console.error('Failed to fetch board:', error);
    }
};

const isAuthenticated = loginStore.isAuthenticated();
const getCollaborateBoards = async () => {
    try {
        if (!isAuthenticated) {
            // Not authenticated
            const { data, status } = await getItemsRes(
                `${import.meta.env.VITE_BASE_URL}/v3/boards/info/${boardId}`,
                loginStore.getToken()
            );
            if (status === 200) {
                const sortedData = data.collaborators.sort((a, b) => new Date(a.addedOn) - new Date(b.addedOn));
                boardStore.setBoards({ collab: sortedData });
            } else {
                console.error(`Failed to fetch board info, status: ${status}`);
                return;
            }
        }
        if (isAuthenticated) {
            // Authenticated users
            const { data, status } = await getItemsRes(
                `${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/collabs`,
                loginStore.getToken()
            );
            if (status === 200) {
                const sortedData = data.sort((a, b) => new Date(a.addedOn) - new Date(b.addedOn));
                boardStore.setBoards({ collab: sortedData });
            } else {
                console.error(`Failed to fetch collaborate boards, status: ${status}`);
            }
        }
    } catch (error) {
        console.error('Failed to fetch boards:', error);
    }
};

const hasPermission = computed(() => {
    return loginStore.getUserId() === boardOwnerId.value; // เช็คว่าผู้ใช้เป็นเจ้าของหรือไม่
});

const addCollab = ref({ email: "", accessRight: "READ" })
const addCollaborator = async () => {
    try {
        const { addedData, status } = await addItem(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/collabs`, addCollab.value, loginStore.getToken());
        if (status === 201) {
            boardStore.addCollaborator(addedData);
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("success")
            notiStore.setNotificationMessage("Add Collaborator Success")
            // await getCollaborateBoards()
            closeAddCollaboratorModal()
        } else if (status === 401) {
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("error")
            notiStore.setNotificationMessage("Refreshing the token.")
        } else if (status === 403) {
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("error")
            notiStore.setNotificationMessage("You do not have permission to add board collaborator.")
            closeAddCollaboratorModal()
        } else if (status === 404) {
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("error")
            notiStore.setNotificationMessage("The user does not exists.")
        } else if (status === 409) {
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("error")
            notiStore.setNotificationMessage("The user is already the collaborator of this board.")
        } else {
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("error")
            notiStore.setNotificationMessage("There is a problem. Please try again later.")
            closeAddCollaboratorModal()
        }
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
};

const collabId = ref(null);
// ค่า tempAccessRight เพื่อเก็บค่าที่เปลี่ยนใน select
const tempAccessRight = ref(null);
const changeAccessRight = async () => {
    try {
        const { data, status } = await updateAccessRight(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/collabs/${collabId.value}`, tempAccessRight.value, loginStore.getToken());
        if (status === 200) {
            boardStore.updateAccessRight({ oid: collabId.value, accessRight: tempAccessRight.value });
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("success")
            notiStore.setNotificationMessage("Change AccessRight Success")
            closeAddCollaboratorModal()
        } else if (status === 401) {
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("error")
            notiStore.setNotificationMessage("Refreshing the token.")
        } else if (status === 403) {
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("error")
            notiStore.setNotificationMessage("You do not have permission to change collaborator access right.")
            closeAddCollaboratorModal()
        } else {
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("error")
            notiStore.setNotificationMessage("There is a problem. Please try again later.")
            closeAddCollaboratorModal()
        }
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
};

const isInvalidEmail = computed(() => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailPattern.test(addCollab.value.email) || addCollab.value.email === loginStore.getUserEmail();
});

const showAddCollaboratorModal = ref(false);
const openAddCollaboratorModal = () => {
    showAddCollaboratorModal.value = true;
};

const closeAddCollaboratorModal = () => {
    showAddCollaboratorModal.value = false;
    addCollab.value = { email: "", accessRight: "READ" }
};

const removeCollaborator = async () => {
    try {
        const { response, status } = await deleteItem(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/collabs/${collabId.value}`, loginStore.getToken());
        if (status === 200) {
            boardStore.removeCollaborator(collabId.value)
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("success")
            notiStore.setNotificationMessage(`Remove "${deleteCollabName.value}" Success`)
            closeAddCollaboratorModal()
        } else if (status === 401) {
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("error")
            notiStore.setNotificationMessage("Refreshing the token.")
        } else if (status === 403) {
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("error")
            notiStore.setNotificationMessage("You do not have permission to remove collaborator.")
            closeAddCollaboratorModal()
        } else if (status === 404) {
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("error")
            notiStore.setNotificationMessage(`${deleteCollabName.value} is not a collaborator.`)
            closeAddCollaboratorModal()
        } else {
            notiStore.setShowNotification(true)
            notiStore.setNotificationType("error")
            notiStore.setNotificationMessage("There is a problem. Please try again later.")
            closeAddCollaboratorModal()
        }
    } catch (error) {
        console.error('Failed to fetch status:', error);
    }
};

const isModalOpen = ref(false);
const modalTitle = ref("");
const modalMessage = ref("");
const modalAction = ref("");

const deleteCollabName = ref("")
const openModal = (title, message, action, id = null, accessRight = null, name = null) => {
    modalTitle.value = title;
    modalMessage.value = message;
    modalAction.value = action;
    collabId.value = id;
    tempAccessRight.value = accessRight;
    deleteCollabName.value = name
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const handleConfirm = async (action) => {
    if (action === "remove") {
        await removeCollaborator()
    } else if (action === 'accessRight') {
        await changeAccessRight()
    }
    closeModal();
};

onBeforeMount(() => {
    getBoardId();
})

onMounted(() => {
    getCollaborateBoards();
});
</script>

<template>
    <div>
        <Profile />
        <header class="pt-14 flex justify-center">
            <h1
                class="mb-6 text-center font-extrabold leading-none tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
                Collaborator Management</h1>
        </header>
        <div class="flex justify-center w-auto">
            <Notification v-if="notiStore.showNotification" />
        </div>
        <div class="flex justify-center">
            <div class="max-h-screen flex justify-center">
                <div class="w-full max-w-screen-lg">
                    <div class="flex gap-4 justify-between items-center mb-2">
                        <p class="itbkk-board-name text-black">{{ boardOwnerName }} personal board > <span
                                class="font-semibold text-violet-800">Collaborator</span></p>
                        <button @click="openAddCollaboratorModal" :disabled="!hasPermission"
                            class="itbkk-manage-status bg-[#28a745] px-6 py-2 rounded-lg text-lg font-bold hover:scale-110 duration-150 text-white hover:bg-[#218838] hover:text-[#f0f0f0] focus:bg-[#1e7e34] disabled:opacity-75 disabled:cursor-not-allowed">Add
                            Collaborator
                        </button>
                    </div>
                    <div class="relative max-h-[20.7em] bg-[#c971fc] overflow-x-hidden shadow-md sm:rounded-lg">
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
                                    <td class="itbkk-access-right text-center px-6 py-4">
                                        <select :value="board.accessRight" :disabled="!hasPermission"
                                            @change="openModal('Change Access Right', `Do you want to change access right of '${board.collaboratorName || board.name}' to '${$event.target.value}'?`, 'accessRight', board.oid, `${$event.target.value}`)"
                                            class="itbkk-select-access-right bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full disabled:opacity-50 disabled:cursor-not-allowed">
                                            <option value="READ">READ</option>
                                            <option value="WRITE">WRITE</option>
                                        </select>
                                    </td>
                                    <td class="text-center px-6 py-4 flex justify-center">
                                        <button
                                            @click='openModal("Remove Collaborator", `Do you want to remove "${board.collaboratorName || board.name}" from the board?`, "remove", board.oid, null, board.collaboratorName || board.name)'
                                            :disabled="!hasPermission"
                                            class="itbkk-leave-board px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 rounded-lg disabled:opacity-75 disabled:cursor-not-allowed">
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
        <div v-if="showAddCollaboratorModal" class="fixed inset-0 z-50 overflow-auto bg-smoke-light flex">
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
                                <option value="WRITE">WRITE</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="flex justify-center">
                    <button
                        class="itbkk-button-confirm px-6 py-4 rounded-lg bg-green-600 hover:bg-green-500 border-0 mr-4 flex-grow hover:scale-105 duration-150 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="isInvalidEmail" @click="addCollaborator">Add</button>
                    <button
                        class="itbkk-button-cancel px-6 py-4 rounded-lg bg-red-500 hover:bg-red-600 border-0 flex-grow hover:scale-105 duration-150 text-white"
                        @click="closeAddCollaboratorModal">Cancel</button>
                </div>
            </form>
        </div>
    </transition>

    <CollabModal :isOpen="isModalOpen" :title="modalTitle" :message="modalMessage" :action="modalAction"
        @close="closeModal" @confirm="handleConfirm" />
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