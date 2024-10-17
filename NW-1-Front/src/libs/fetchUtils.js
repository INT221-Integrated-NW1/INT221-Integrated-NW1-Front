import router from "@/router";

async function getItemsRes(url, header) {
	try {
		const response = await fetch(url, {
			headers: {
				"Authorization": `Bearer ${header}`
			},
		});
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
		const data = await fetch(url, {
			headers: {
				"Authorization": `Bearer ${header}`
			},
		});
		if (data.status === 401) {
			router.push({ name: "Login" })
		}
		const items = await data.json();
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
				"Authorization": `Bearer ${header}`
			},
		});
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
		const res = await fetch(url, {
			method: "DELETE",
			headers: {
				"Authorization": `Bearer ${header}`
			},
		});
		return res.status;
	} catch (error) {
		console.log(`error: ${error}`);
	}
}

async function deleteItemById(url, id, header) {
	try {
		const res = await fetch(`${url}/${id}`, {
			method: "DELETE",
			headers: {
				"Authorization": `Bearer ${header}`
			},
		});
		return res.status;
	} catch (error) {
		console.log(`error: ${error}`);
	}
}

async function deleteTransfer(url, oldStatusId, newStatusId, header) {
	try {
		const res = await fetch(`${url}/${oldStatusId}/${newStatusId}`, {
			method: "DELETE",
			headers: {
				"Authorization": `Bearer ${header}`
			},
		});
		return res.status;
	} catch (error) {
		console.log(`Error deleting with transfer: ${error}`);
	}
}

async function addItem(url, newItem, header) {
	try {
		const res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${header}`
			},
			body: JSON.stringify({
				...newItem,
			}),
		});
		const addedItem = await res.json();
		return addedItem;
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