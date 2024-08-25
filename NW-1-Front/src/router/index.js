import { createRouter, createWebHistory } from "vue-router";
import TaskList from "../views/TaskList.vue";
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
			{
				path: ":id",
				name: "TaskModal",
				component: () => import("../views/TaskModal.vue"),
				beforeEnter: async (to, from, next) => {
					const id = parseInt(to.params.id);
					const response = await fetch(
						`${import.meta.env.VITE_BASE_URL}/v2/tasks/${id}`
					);
					if (response.ok) {
						next();
					} else {
						window.alert("The requested task does not exist");
						next({ name: "TaskList" });
						// next(router.go(-1));
						console.log(`The requested task Id:${id} does not exist `);
					}
				},
			},
			{
				path: ":id/edit",
				name: "EditTask",
				component: () => import("../views/EditTask.vue"),
				beforeEnter: async (to, from, next) => {
					const id = parseInt(to.params.id);
					const response = await fetch(
						`${import.meta.env.VITE_BASE_URL}/v2/tasks/${id}`
					);
					if (response.ok) {
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
					const id = parseInt(to.params.id);
					const response = await fetch(
						`${import.meta.env.VITE_BASE_URL}/v2/statuses/${id}`
					);
					if (response.ok) {
						next();
					} else {
						window.alert("The requested status does not exist");
						next({ name: "StatusList" });
						console.log(`The requested status Id:${id} does not exist `);
					}
				},
			},
		],
	},
	{
		path: "/:pathMatch(.*)",
		name: "NotFound",
		component: () => import("../views/NotFound.vue"),
		redirect: "/task",
	},
	{
		path: "/login",
		name: "Login",
		component: () => import("../views/Login.vue"),
	},
];

const router = createRouter({
	history,
	routes,
});

// Global navigation guard
// router.beforeEach((to, from, next) => {
// 	const loginStore = useLoginStore();
// 	const isAuthenticated = loginStore.isAuthenticated();
// 	if (to.name !== "Login" && !isAuthenticated) {
// 		next({ name: "Login" });
// 	} else {
// 		next();
// 	}
// });

export default router;
