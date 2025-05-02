// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue';
import Campaigns from '../views/Campaigns.vue';
import SignIn from '../views/Signin.vue';


const routes = [
  { path: '/signin', component: SignIn },
  { path: '/campaigns', component: Campaigns, meta: { requiresAuth: true } },
  { path: '/', component: Home }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
