// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthenticator } from '@aws-amplify/ui-vue'

import Campaigns from '../views/Campaigns.vue'
import SignIn from '../views/Signin.vue'

const routes = [
  { path: '/signin', component: SignIn },
  { path: '/', component: Campaigns, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { authStatus } = useAuthenticator()

  if (to.meta.requiresAuth && authStatus !== 'authenticated') {
    next('/signin')
  } else {
    next()
  }
})

export default router
