import { ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useLoginStore = defineStore("loginStore", () => {
	const token = ref(null);
	const username = ref(null);
	const name = ref("");

	const login = (newToken) => {
		name.value = newToken.name;
		const d = new Date(newToken.exp * 1000);
		const expires = "expires=" + d.toUTCString();
		document.cookie = "name =" + newToken.name + ";" + expires + ";path=/";
		document.cookie = "token=" + token.value + ";" + expires + ";path=/";
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
	const getToken = () => {
		if (!token.value) {
            token.value = getCookie("token")
        }
		return token.value
	}
	const setToken = (newToken) => {
		token.value = newToken;
	};
	const isAuthenticated = () => {
		return getCookie("name") !== null;
		// return getCookie("name") !== null && token !== null || undefined;
	};
	return {
		token,
		username,
		name,
		login,
		getName,
		setToken,
		isAuthenticated,
		getToken
	};
});
if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useLoginStore, import.meta.hot));
}