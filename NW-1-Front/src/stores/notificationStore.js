import { ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useNotiStore = defineStore("notificationStore", () => {
	const showNotification = ref(false);
	const notificationMessage = ref("");

	const setShowNotification = (boolean) => {
		showNotification.value = boolean;
	};

	const setNotificationMessage = (message) => {
		notificationMessage.value = message;
	};

	return {
		notificationMessage,
		showNotification,
		setNotificationMessage,
		setShowNotification,
	};
});
if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useNotiStore, import.meta.hot));
}
