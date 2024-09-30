import { createRouter, createWebHistory } from "vue-router";
import TaskList from "../views/TaskList.vue";
import { getItemById } from "@/libs/fetchUtils";
import { useLoginStore } from "../stores/loginStore";

const history = createWebHistory(import.meta.env.BASE_URL);
const routes = [
	{
		path: "/task",
		name: "TaskList",
		component: TaskList,
		children: [
			{
				path: "add",
				name: "AddTask",
				component: () => import("../views/AddTask.vue"),
			},
			// {
			// 	path: ":id",
			// 	name: "TaskModal",
			// 	component: () => import("../views/TaskModal.vue"),
			// 	beforeEnter: async (to, from, next) => {
			// 		const loginStore = useLoginStore();
			// 		const id = parseInt(to.params.id);
			// 		const { res } = await getItemById(
			// 			`${import.meta.env.VITE_BASE_URL}/v2/tasks`, id, loginStore.getToken()
			// 		);
			// 		if (res === 200) {
			// 			next();
			// 		} else {
			// 			window.alert("The requested task does not exist");
			// 			next({ name: "TaskList" });
			// 			// next(router.go(-1));
			// 			console.log(`The requested task Id: ${id} does not exist`);
			// 		}
			// 	},
			// },
			{
				path: ":id/edit",
				name: "EditTask",
				component: () => import("../views/EditTask.vue"),
				beforeEnter: async (to, from, next) => {
					const loginStore = useLoginStore();
					const id = parseInt(to.params.id);
					const { res } = await getItemById(
						`${import.meta.env.VITE_BASE_URL}/v2/tasks`, id, loginStore.getToken()
					);
					if (res === 200) {
						next();
					} else {
						window.alert("The requested task does not exist");
						next({ name: "TaskList" });
						console.log(`The requested task Id:${id} does not exist `);
					}
				},
			},
		],
	},
	{
		path: "/status/manage",
		name: "StatusList",
		component: () => import("../views/StatusList.vue"),
		children: [
			{
				path: "/status/add",
				name: "AddStatus",
				component: () => import("../views/AddStatus.vue"),
			},
			{
				path: "/status/:id/edit",
				name: "EditStatus",
				component: () => import("../views/EditStatus.vue"),
				beforeEnter: async (to, from, next) => {
					const loginStore = useLoginStore();
					const id = parseInt(to.params.id);
					const { res } = await getItemById(
						`${import.meta.env.VITE_BASE_URL}/v2/statuses`, id, loginStore.getToken()
					);
					if (res === 200) {
						next();
					} else {
						window.alert("The requested status does not exist");
						next({ name: "StatusList" });
						console.log(`The requested status Id: 	${id} does not exist `);
					}
				},
			},
		],
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
		children: [
			{
				path: '/board/:id/task/add',
				name: 'AddBoardTask',
				component: () => import("../components/AddBoardTask.vue")
			},
			{
				path: "/board/:id/tasks/:taskId",
				name: "TaskModal",
				component: () => import("../views/TaskModal.vue"),
			},
			{
				path: "/board/:id/tasks/:task-id/edit",
				name: "EditBoardTask",
				component: () => import("../components/EditBoardTask.vue"),
			},
		]
	},
	{
		path: "/board/:id/status",
		name: "StatusBoard",
		component: () => import("../views/StatusBoard.vue"),
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
		redirect: "/task",
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

export default router;