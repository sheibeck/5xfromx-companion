// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import SignIn from '../views/Signin.vue';
import Home from '../views/Home.vue';
import Campaigns from '../views/Campaigns.vue';
import CampaignEdit from '../views/CampaignEdit.vue'

const routes = [
  { path: '/signin', component: SignIn },
  { path: '/campaigns', component: Campaigns, meta: { requiresAuth: true } },
  { path: '/campaigns/:id', component: CampaignEdit, meta: { requiresAuth: true } },
  { path: '/', component: Home }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
