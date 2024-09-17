async function getItems(url, header) {
	try {
		const data = await fetch(url, {
			headers: {
				"Authorization": `Bearer ${header}`
			},
		});
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
		return item;
	} catch (error) {
		console.log("Tasks Not Found!");
		console.log(`error: ${error}`);
		console.log(data.status);
		if (data.status === 404) return undefined;
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

export {
	getItems,
	getItemById,
	deleteItemById,
	addItem,
	editItem,
	deleteTransfer,
};