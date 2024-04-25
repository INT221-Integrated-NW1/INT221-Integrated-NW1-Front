import { createRouter, createWebHistory } from "vue-router";
import TaskList from "../views/TaskList.vue";

const history = createWebHistory();
const routes = [
	{
		path: "/task",
		name: "TaskList",
		component: TaskList,
		children: [
			{
				path: ":id",
				name: "TaskModal",
				component: () => import("../views/TaskModal.vue"),
				beforeEnter: async (to, from, next) => {
					const id = parseInt(to.params.id);

					const response = await fetch(`http://localhost:8080/v1/tasks/${id}`);
					if (response.ok) {
						next();
					} else {
						next({ path: "/task" });
						console.log(`The requested task Id:${id} does not exist `);
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
];

const router = createRouter({
	history,
	routes,
});

export default router;
