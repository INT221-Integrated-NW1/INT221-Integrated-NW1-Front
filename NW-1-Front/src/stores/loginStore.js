import { ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useLoginStore = defineStore("loginStore", () => {
	const token = ref(null);
	const username = ref(null);
	const name = ref(null);

	const login = (newToken, newUsername) => {
		token.value = newToken;
		username.value = newUsername;
		localStorage.setItem("authToken", newToken);
		localStorage.setItem("username", newUsername);
	};
	const loadAuthFromLocalStorage = () => {
		token.value = localStorage.getItem("authToken");
		username.value = localStorage.getItem("username");
		name.value = localStorage.getItem("name");
	};
	const logout = () => {
		token.value = null;
		username.value = null;
		name.value = null;
		localStorage.removeItem("authToken");
		localStorage.removeItem("username");
		localStorage.removeItem("name");
	};
	return {
		token,
		username,
		name,
		login,
		loadAuthFromLocalStorage,
		logout,
	};
});
if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useLoginStore, import.meta.hot));
}