import { ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import router from "@/router";

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
		const expirationDate = new Date(newToken.exp * 1000);
		const expire = expirationDate.toUTCString();
		const refreshTokenExpiry = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
		// Set cookies
		document.cookie = `name =${newToken.name}; expires=${expire}; path=/;`;
		document.cookie = `oid=${newToken.oid}; expires=${expire}; path=/;`;
		document.cookie = `token=${newToken.access_token}; expires=${expire}; path=/;`;
		document.cookie = `refresh_token=${newToken.refresh_token}; expires=${refreshTokenExpiry}; path=/;`;
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
		return getCookie("token")
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
		return getCookie("token") || getCookie("refresh_token") !== null;
	};

	const logout = () => {
		token.value = null;
		refreshToken.value = null;
		name.value = "";
		oid.value = null;
		["name", "oid", "token", "refresh_token"].forEach((key) => {
			document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		});
		router.push({name: "Login"})
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