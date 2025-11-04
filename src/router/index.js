import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { auth } from 'boot/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useEventStore } from 'stores/event-store'

// ✅ Add auth ready promise
let authReady = false
const authReadyPromise = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    authReady = true
    unsubscribe()
    resolve(user)
  })
})

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to, _, next) => {
    // ✅ Wait for auth to be ready first
    if (!authReady) {
      await authReadyPromise
    }

    const eventStore = useEventStore()

    // Check if route requires an active event
    if (to.meta.requiresEvent) {
      if (to.params.eventId || to.params.startupId) {
        next()
        return
      }

      if (!eventStore.currentEvent) {
        next('/home')
        return
      }
    }

    // Your existing authentication logic
    if (!to.meta.requiresAuth) {
      next()
      return
    }

    // ✅ Now auth is ready, check current user
    const user = auth.currentUser

    if (user) {
      next()
      return
    }

    next({ path: '/sign-in', query: { redirect: to.fullPath } })
  })

  return Router
})
