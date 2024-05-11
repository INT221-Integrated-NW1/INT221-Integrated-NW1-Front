import { createRouter, createWebHistory } from "vue-router";
import TaskList from "../views/TaskList.vue";

const history = createWebHistory("/nw1");
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
					const response = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/tasks/${id}`);
					if (response.ok) {
						next();
					} else {
						window.alert("The requested task does not exist");
						next('/task');
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
					const response = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/tasks/${id}`);
					if (response.ok) {
						next();
					} else {
						window.alert("The requested task does not exist");
						next('/task');
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

export default router;