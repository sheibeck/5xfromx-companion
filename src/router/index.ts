// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Campaigns from '../views/Campaigns.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Campaigns',
    component: Campaigns,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
