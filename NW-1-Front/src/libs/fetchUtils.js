import router from "@/router";

function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
	return null;
}

function parseJwt(token) {
	try {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map(c => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
				.join('')
		);
		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error("Invalid token:", error);
		return null;
	}
}

async function getRefreshToken() {
	try {
		const refreshToken = getCookie("refresh_token");
		if (!refreshToken) throw new Error("No refresh token found");

		const response = await fetch(`${import.meta.env.VITE_BASE_URL}/token`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${refreshToken}`,
			},
		});

		if (!response.ok) throw new Error("Failed to refresh token");
		const token = await response.json();
		const { exp } = parseJwt(token.access_token)
		const expireDate = new Date(exp * 1000);
		const expire = expireDate.toUTCString();
		document.cookie = `token=${token.access_token}; expires=${expire}; path=/;`;
	} catch (error) {
		console.log(`Error refreshing token: ${error.message}`);
	}
}

async function getItemsRes(url, header) {
	try {
		const response = await fetch(url, {
			headers: {
				"Authorization": header ? `Bearer ${header}` : ""
			},
		});
		if (response.status === 401 || response.status === 403) {
			await getRefreshToken()
		}
		const result = await response.json();
		return {
			status: response.status,
			data: result,
		};
	} catch (error) {
		console.log(`error: ${error}`);
	}
}

async function getItems(url, header) {
	try {
		const response = await fetch(url, {
			headers: {
				"Authorization": header ? `Bearer ${header}` : ""
			},
		});
		if (response.status === 401 || response.status === 403) {
			console.log("Get New Access Token");
			await getRefreshToken()
			// router.push({ name: "Login" })
		}
		const items = await response.json();
		return items;
	} catch (error) {
		console.log(`error: ${error}`);
	}
}

async function getItemById(url, id, header) {
	let data;
	try {
		data = await fetch(`${url}/${id}`, {
			headers: {
				"Authorization": header ? `Bearer ${header}` : ""
			},
		});
		if (data.status === 401 || data.status === 403) {
			await getRefreshToken()
		}
		const item = await data.json();
		return { res: data.status, data: item };
	} catch (error) {
		console.log("Tasks Not Found!");
		console.log(`error: ${error}`);
		console.log(data.status);
		if (data.status === 404) return undefined;
	}
}

async function deleteItem(url, header) {
	try {
		const response = await fetch(url, {
			method: "DELETE",
			headers: {
				"Authorization": `Bearer ${header}`
			},
		});
		if (response.status === 401 || response.status === 403) {
			await getRefreshToken()
		}
		return response.status;
	} catch (error) {
		console.log(`error: ${error}`);
	}
}

async function deleteItemById(url, id, header) {
	try {
		const response = await fetch(`${url}/${id}`, {
			method: "DELETE",
			headers: {
				"Authorization": `Bearer ${header}`
			},
		});
		if (response.status === 401 || response.status === 403) {
			await getRefreshToken()
		}
		return response.status;
	} catch (error) {
		console.log(`error: ${error}`);
	}
}

async function deleteTransfer(url, oldStatusId, newStatusId, header) {
	try {
		const response = await fetch(`${url}/${oldStatusId}/${newStatusId}`, {
			method: "DELETE",
			headers: {
				"Authorization": `Bearer ${header}`
			},
		});
		if (response.status === 401 || response.status === 403) {
			await getRefreshToken()
		}
		return response.status;
	} catch (error) {
		console.log(`Error deleting with transfer: ${error}`);
	}
}

async function addItem(url, newItem, header) {
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${header}`
			},
			body: JSON.stringify({
				...newItem,
			}),
		});
		if (response.status === 401 || response.status === 403) {
			await getRefreshToken()
		}
		const result = await response.json();
		return {
			status: response.status,
			addedData: result
		};
	} catch (error) {
		console.log(`error: ${error}`);
	}
}

async function editItem(url, data, header) {
	const response = await fetch(url, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${header}`
		},
		body: JSON.stringify(data),
	});
	if (response.status === 401 || response.status === 403) {
		await getRefreshToken()
	}
	if (!response.ok) {
		throw new Error(`error: ${response.status}`);
	}
	return await response.json();
}

async function editTask(url, data, header) {
	try {
		const response = await fetch(url, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${header}`
			},
			body: JSON.stringify(data),
		});
		if (response.status === 401 || response.status === 403) {
			await getRefreshToken()
		}
		const result = await response.json();
		return {
			status: response.status,
			data: result,
		};
	} catch (error) {
		console.log(`error: ${error}`);
		return {
			status: "error",
			message: error.message,
		};
	}
}

async function updateBoardVisibility(url, visibility, header) {
	try {
		const response = await fetch(url, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${header}`
			},
			body: JSON.stringify({ visibility }),
		});
		if (response.status === 401 || response.status === 403) {
			await getRefreshToken()
		}
		const updatedBoard = await response.json();
		return {
			status: response.status,
			data: updatedBoard,
		};
	} catch (error) {
		return {
			status: "error",
			message: error.message,
		};
	}
}

export {
	getItems,
	getItemById,
	deleteItemById,
	addItem,
	editItem,
	deleteTransfer,
	deleteItem,
	editTask,
	getItemsRes,
	updateBoardVisibility,
};