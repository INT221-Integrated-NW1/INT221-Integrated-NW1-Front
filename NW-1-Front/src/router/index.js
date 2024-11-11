import { createRouter, createWebHistory } from "vue-router";
import { getItemsRes } from "@/libs/fetchUtils";
import { useLoginStore } from "@/stores/loginStore";

const history = createWebHistory(import.meta.env.BASE_URL);
const routes = [
	{
		path: "/",
		name: "Home",
		redirect: "/login",
	},
	{
		path: "/board",
		name: "Board",
		component: () => import("../views/Board.vue"),
		children: [
			{
				path: '/board/add',
				name: 'AddBoard',
				component: () => import("../components/AddBoard.vue")
			},
		]
	},
	{
		path: "/board/:id",
		name: "TaskBoard",
		component: () => import("../views/TaskBoard.vue"),
		beforeEnter: async (to, from, next) => {
			const { id: boardId } = to.params;
			const { isOwner, isPublic, status } = await checkBoardAccess(boardId);
			if (isOwner || isPublic) {
				next();
			}
			else if (status === 403) {
				next({ name: "AccessDenied" });
			}
			else {
				console.log(status);
				next({ name: "Login" });
			}
		},
		children: [
			{
				path: '/board/:id/task/add',
				name: 'AddBoardTask',
				component: () => import("../components/AddBoardTask.vue"),
				beforeEnter: async (to, from, next) => {
					const { id: boardId } = to.params;
					const { isOwner, isPublic } = await checkBoardAccess(boardId);
					if (!isOwner && isPublic) {
						next({ name: "AccessDenied" });
					} else {
						next();
					}
				},
			},
			{
				path: "/board/:id/task/:task-id",
				name: "TaskModal",
				component: () => import("../views/TaskModal.vue"),
				beforeEnter: async (to, from, next) => {
					const loginStore = useLoginStore();
					const taskId = parseInt(to.params.task);
					const boardId = to.params.id;
					const { status, data } = await getItemsRes(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/tasks/${taskId}`, loginStore.getToken());
					if (status === 200) {
						next();
					}
					else if (status === 401) {
						window.alert("Refreshing Token");
						next();
					}
					else {
						window.alert("The requested task does not exist");
						next(router.go(-1));
					}
				},
			},
			{
				path: "/board/:id/task/:task-id/edit",
				name: "EditBoardTask",
				component: () => import("../components/EditBoardTask.vue"),
				beforeEnter: async (to, from, next) => {
					const loginStore = useLoginStore();
					const taskId = parseInt(to.params.task);
					const boardId = to.params.id;

					// Check board access
					const { isOwner, isPublic } = await checkBoardAccess(boardId);
					if (!isOwner && isPublic) {
						next({ name: "AccessDenied" });
						return;
					}

					const { status, data } = await getItemsRes(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/tasks/${taskId}`, loginStore.getToken());
					if (status === 200) {
						next();
					}
					else if (status === 401) {
						window.alert("Refreshing Token");
						next();
					}
					else {
						console.error(`The requested task Id: ${taskId} does not exist`);
						window.alert("The requested task does not exist");
						next(router.go(-1));
					}
				},
			},
		]
	},
	{
		path: "/board/:id/collab",
		name: "CollabBoard",
		component: () => import("../views/CollabBoard.vue"),
	},
	{
		path: "/board/:id/status",
		name: "StatusBoard",
		component: () => import("../views/StatusBoard.vue"),
		beforeEnter: async (to, from, next) => {
			const { id: boardId } = to.params;
			const { isOwner, isPublic } = await checkBoardAccess(boardId);
			if (isOwner || isPublic) {
				next();
			} else {
				next({ name: "AccessDenied" });
			}
		},
		children: [
			{
				path: '/board/:id/status/add',
				name: 'AddBoardStatus',
				component: () => import("../components/AddBoardStatus.vue")
			},
			{
				path: '/board/:id/status/:status-id/edit',
				name: 'EditBoardStatus',
				component: () => import("../components/EditBoardStatus.vue"),
				beforeEnter: async (to, from, next) => {
					const loginStore = useLoginStore();
					const id = to.params.id;
					const statusId = to.params.status
					const { status, data } = await getItemsRes(`${import.meta.env.VITE_BASE_URL}/v3/boards/${id}/statuses/${statusId}`, loginStore.getToken());
					if (status === 200) {
						next();
					} 
					else if (status === 401) {
						window.alert("Refreshing Token");
						next();
					}
					else {
						window.alert("The requested status does not exist");
						next(router.go(-1));
						console.log(`The requested status Id: ${id} does not exist`);
					}
				},
			},
		]
	},
	{
		path: "/login",
		name: "Login",
		component: () => import("../views/Login.vue"),
	},
	{
		path: "/:pathMatch(.*)",
		name: "NotFound",
		component: () => import("../views/NotFound.vue"),
		redirect: "/board",
	},
	{
		path: "/AccessDenied",
		name: "AccessDenied",
		component: () => import("../views/AccessDenied.vue"),
	},
];

const router = createRouter({
	history,
	routes,
});

// Global navigation guard
router.beforeEach(async (to, from, next) => {
	const loginStore = useLoginStore();
	const isAuthenticated = loginStore.isAuthenticated();
	if (to.name === "Login") {
		// Always allow access to the login page
		return next();
	}
	if (to.params.id) {
		try {
			// Fetch board data based on the route parameter
			const response = await getItemsRes(
				`${import.meta.env.VITE_BASE_URL}/v3/boards/${to.params.id}`,
				loginStore.getToken() || null
			);
			// Ensure response and data are valid
			if (response && response.data) {
				const board = response.data;
				if (board.visibility === "PUBLIC") {
					return next(); // Allow access to PUBLIC boards
				} else if (isAuthenticated && board.user.oid === loginStore.getUserId()) {
					return next(); // Allow access to private boards for the owner
				} else {
					return next({ name: "Login" });
				}
			}
		} catch (error) {
			if (error.message.includes("403")) {
				console.error("Access forbidden, refreshing token...");
				await getRefreshToken(); // Call function to refresh token
				try {
					// Retry fetching board data with new token
					const response = await getItemsRes(
						`${import.meta.env.VITE_BASE_URL}/v3/boards/${to.params.id}`,
						loginStore.getToken() || null
					);

					if (response && response.data) {
						const board = response.data;
						if (board.visibility === "PUBLIC") {
							return next(); // Allow access to PUBLIC boards
						} else if (isAuthenticated && board.user.oid === loginStore.getUserId()) {
							return next(); // Allow access to private boards for the owner
						}
					}
				} catch (retryError) {
					console.error("Error fetching board data after refreshing token:", retryError);
				}
			} else {
				console.error("Error fetching board data:", error);
				return next({ name: "Login" });
			}
		}
	}
	// If not accessing a board and not authenticated, restrict protected routes
	if (!isAuthenticated && to.meta.requiresAuth) {
		return next({ name: "Login" });
	}
	next();
});

const checkBoardAccess = async (boardId) => {
	try {
		const loginStore = useLoginStore();
		const response = await getItemsRes(
			`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}`,
			loginStore.getToken()
		);
		// ตรวจสอบว่า response ไม่เป็นค่าว่าง
		if (!response || !response.status) {
			throw new Error("Failed to fetch board data.");
		}
		const { status, data } = response;
		if (status === 200) {
			const isOwner = data.user.oid === loginStore.getUserId();
			const isPublic = data.visibility === "PUBLIC";
			return { isOwner, isPublic };
		} else {
			return { isOwner: false, isPublic: false, status };
		}
	} catch (error) {
		console.error("Error in checkBoardAccess:", error);
		// ถ้าเกิดข้อผิดพลาดใด ๆ คืนค่าการเข้าถึงเป็น false
		return { isOwner: false, isPublic: false, status: 500 };
	}
};

export default router;