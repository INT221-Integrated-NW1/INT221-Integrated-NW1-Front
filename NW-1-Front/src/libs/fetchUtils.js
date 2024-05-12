async function getItems(url) {
	try {
		const data = await fetch(url); //GET Method
		const items = await data.json();
		return items;
	} catch (error) {
		console.log(`error: ${error}`);
	}
}

async function getItemById(url, id) {
	let data;
	try {
		data = await fetch(`${url}/${id}`);
		const item = await data.json();
		return item;
	} catch (error) {
		console.log("Tasks Not Found!");
		console.log(`error: ${error}`);
		console.log(data.status);
		if (data.status === 404) return undefined;
	}
}

async function deleteItemById(url, id) {
	console.log(`${url}/${id}`);

	try {
		const res = await fetch(`${url}/${id}`, {
			method: "DELETE",
		});
		return res.status;
	} catch (error) {
		console.log(`error: ${error}`);
	}
}

async function addItem(url, newItem) {
	try {
		const res = await fetch(url, {
			method: "POST",
			headers: {
				"content-type": "application/json",
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

async function editItem(url, data) {
	const response = await fetch(url, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error(`error: ${response.status}`);
	}

	return await response.json();
}

export { getItems, getItemById, deleteItemById, addItem, editItem };
