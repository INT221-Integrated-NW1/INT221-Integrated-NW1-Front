import { ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useLoginStore = defineStore("loginStore", () => {
	const token = ref(null);
	const username = ref(null);
	const name = ref("");

	const login = (newToken) => {
		token.value = newToken;
		localStorage.setItem("name", newToken.name);
		name.value = newToken.name;
		const d = new Date(newToken.exp * 1000);
		const expires = "expires=" + d.toUTCString();
		document.cookie = "name =" + newToken.name + ";" + expires + ";path=/";
	};
	const getCookie = (cookieName) => {
		const nameEQ = cookieName + "=";
		const cookies = document.cookie.split(";");
		for (let i = 0; i < cookies.length; i++) {
			let c = cookies[i];
			while (c.charAt(0) === " ") c = c.substring(1);
			if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
	};
	const getName = () => {
		if (name.value === "") {
			name.value = getCookie("name");
		}
		return name.value;
	};
	const isAuthenticated = () => {
		return getCookie("name") !== null;
	};
	return {
		token,
		username,
		name,
		login,
		getName,
		isAuthenticated,
	};
});
if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useLoginStore, import.meta.hot));
}