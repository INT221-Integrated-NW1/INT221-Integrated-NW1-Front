import { createRouter, createWebHistory } from "vue-router";
import { getItemsRes } from "@/libs/fetchUtils";
import { useLoginStore } from "../stores/loginStore";

const history = createWebHistory(import.meta.env.BASE_URL);
const routes = [
	{
		path: "/",
		name: "Home",
		redirect: "/board",
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
			const { isOwner, isPublic } = await checkBoardAccess(boardId);
			if (isOwner || isPublic) {
				next();
			} else {
				next({ name: "AccessDenied" });
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
					if (isOwner || isPublic) {
						next();
					} else {
						next({ name: "AccessDenied" });
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
					} else {
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
					const { status, data } = await getItemsRes(`${import.meta.env.VITE_BASE_URL}/v3/boards/${boardId}/tasks/${taskId}`, loginStore.getToken());
					if (status === 200) {
						next();
					} else {
						window.alert("The requested task does not exist");
						// next({ name: "TaskBoard" });
						next(router.go(-1));
						console.log(`The requested task Id: ${id} does not exist`);
					}
				},
			},
		]
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
					} else {
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
router.beforeEach((to, from, next) => {
	const loginStore = useLoginStore();
	const isAuthenticated = loginStore.isAuthenticated();
	if (to.name !== "Login" && !isAuthenticated) {
		next({ name: "Login" });
	} else {
		next();
	}
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
			return { isOwner: false, isPublic: false };
		}
	} catch (error) {
		console.error("Error in checkBoardAccess:", error);
		// ถ้าเกิดข้อผิดพลาดใด ๆ คืนค่าการเข้าถึงเป็น false
		return { isOwner: false, isPublic: false };
	}
};

export default router;