import { ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useLoginStore = defineStore("loginStore", () => {
	const token = ref(null);
	const refreshToken = ref(null);
	const name = ref("");
	const oid = ref(null);

	const login = (newToken) => {
		token.value = newToken.access_token;
		refreshToken.value = newToken.refresh_token;
		name.value = newToken.name;
		oid.value = newToken.oid;
		const d = new Date(newToken.exp * 1000);
		const expires = "expires=" + d.toUTCString();
		document.cookie = "name =" + newToken.name + ";" + expires + ";path=/";
		document.cookie = "oid=" + newToken.oid + ";" + expires + ";path=/";
		document.cookie = `token=${newToken.access_token}; expires=${expires}; path=/;`;
		document.cookie = `refresh_token=${newToken.refresh_token}; expires=${expires}; path=/;`;
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
		if (!name.value) {
			name.value = getCookie("name");
		}
		return name.value;
	};
	const getToken = () => {
		const storedToken = getCookie("token");
		if (!token.value && storedToken) {
			token.value = storedToken;
		}
		return token.value || null;
	}
	const getRefreshToken = () => {
		if (!refreshToken.value) refreshToken.value = getCookie("refresh_token");
		return refreshToken.value;
	};
	const getUserId = () => {
		if (!oid.value) {
			oid.value = getCookie("oid");
		}
		return oid.value;
	};
	const setToken = (newToken) => {
		token.value = newToken;
	};
	const isAuthenticated = () => {
		return getCookie("token") !== null;
	};
	const logout = () => {
		token.value = null;
		refreshToken.value = null;
		name.value = "";
		oid.value = null;
		document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		document.cookie = "oid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	};
	return {
		login,
		logout,
		getName,
		getToken,
		getRefreshToken,
		getUserId,
		setToken,
		isAuthenticated,
	};
});
if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useLoginStore, import.meta.hot));
}