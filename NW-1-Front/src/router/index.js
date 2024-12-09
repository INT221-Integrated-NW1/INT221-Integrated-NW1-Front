import { createRouter, createWebHistory } from "vue-router";
import { getItemsRes, getRefreshToken } from "@/libs/fetchUtils";
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
			const { isOwner, isPublic, readAccess, writeAccess, status } = await checkBoardAccess(boardId);
			if (isOwner || isPublic || readAccess || writeAccess) {
				return next();
			}
			else if (status === 403) {
				return next({ name: "AccessDenied" });
			}
			else {
				console.error(`Error status: ${status}`);
				return next({ name: "Login" });
			}
		},
		children: [
			{
				path: '/board/:id/task/add',
				name: 'AddBoardTask',
				component: () => import("../components/AddBoardTask.vue"),
				beforeEnter: async (to, from, next) => {
					const { id: boardId } = to.params;
					const { isOwner, writeAccess } = await checkBoardAccess(boardId);
					if (!isOwner && !writeAccess) {
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
					const { isOwner, writeAccess } = await checkBoardAccess(boardId);
					if (!isOwner && !writeAccess) {
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
			const { isOwner, isPublic, readAccess, writeAccess, status } = await checkBoardAccess(boardId);
			if (isOwner || isPublic || readAccess || writeAccess) {
				next();
			} else if (status === 403) {
				next({ name: "AccessDenied" });
			}
			else {
				next({ name: "Login" });
			}
		},
		children: [
			{
				path: '/board/:id/status/add',
				name: 'AddBoardStatus',
				component: () => import("../components/AddBoardStatus.vue"),
				beforeEnter: async (to, from, next) => {
					const { id: boardId } = to.params;
					const { isOwner, writeAccess } = await checkBoardAccess(boardId);
					if (!isOwner || !writeAccess) {
						next({ name: "AccessDenied" });
					} else {
						next();
					}
				},
			},
			{
				path: '/board/:id/status/:status-id/edit',
				name: 'EditBoardStatus',
				component: () => import("../components/EditBoardStatus.vue"),
				beforeEnter: async (to, from, next) => {
					const loginStore = useLoginStore();
					const boardId = to.params.id;
					const statusId = to.params.status
					const { isOwner, writeAccess } = await checkBoardAccess(boardId);
					if (!isOwner && !writeAccess) {
						next({ name: "AccessDenied" });
						return;
					}
					const { status, data } = await getItemsRes(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/statuses/${statusId}`, loginStore.getToken());
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
	// Always allow access to the login page
	if (to.name === "Login") {
		return next();
	}
	if (to.params.id) {
		const { isOwner, isPublic, readAccess, writeAccess, status } = await checkBoardAccess(to.params.id);
		// Check if user has access
		if (isOwner || isPublic || readAccess || writeAccess) {
			return next();
		} else if (status === 401) {
			getRefreshToken()
			return next();
		} else if (status === 403) {
			return next({ name: "AccessDenied" });
		} else {
			return next({ name: "Login" });
		}
	}
	// If route requires authentication and user is not authenticated
	if (!isAuthenticated && to.meta.requiresAuth) {
		return next({ name: "Login" });
	}
	next();
});

const checkBoardAccess = async (boardId) => {
	try {
		const loginStore = useLoginStore();
		const { status, data } = await getItemsRes(
			`${import.meta.env.VITE_BASE_URL}/v3/boards/info/${boardId}`,
			loginStore.getToken()
		);
		console.log(data);
		console.log(status);
		if (status === 200) {
			let isOwner = false;
			let isPublic = false;
			let readAccess = false;
			let writeAccess = false;

			const personalBoard = data
			if (personalBoard) {
				isOwner = personalBoard.user.oid === loginStore.getUserId();
				isPublic = personalBoard.visibility === "PUBLIC";
			}

			if (data.collaborators) {
				const currentUserCollaboration = data.collaborators.find(
					(collaborator) => collaborator.oid === loginStore.getUserId()
				);

				if (currentUserCollaboration) {
					if (currentUserCollaboration.accessRight === "READ") {
						readAccess = true;
					} else if (currentUserCollaboration.accessRight === "WRITE") {
						writeAccess = true;
					}
				}
			}
			return { isOwner, isPublic, readAccess, writeAccess, status };
		} else {
			return { isOwner: false, isPublic: false, readAccess: false, writeAccess: false, status };
		}
	} catch (error) {
		console.error("Error in checkBoardAccess:", error);
		return { isOwner: false, isPublic: false, readAccess: false, writeAccess: false, status: 500 };
	}
};

export default router;