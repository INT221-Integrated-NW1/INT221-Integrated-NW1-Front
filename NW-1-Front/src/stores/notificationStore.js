import { ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useNotiStore = defineStore("notificationStore", () => {
	const showNotification = ref(false);
	const notificationMessage = ref("");
	const notificationType = ref("success");

	const setShowNotification = (boolean) => {
		showNotification.value = boolean;
	};

	const setNotificationMessage = (message) => {
		notificationMessage.value = message;
	};

	const setNotificationType = (type) => {
		notificationType.value = type;
	};

	return {
		notificationMessage,
		showNotification,
		setNotificationMessage,
		setShowNotification,
		notificationType,
		setNotificationType,
	};
});
if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useNotiStore, import.meta.hot));
}
