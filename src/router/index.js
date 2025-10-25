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

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to, _, next) => {
    // Initialize event store
    const eventStore = useEventStore()

    // Check if route requires an active event
    if (to.meta.requiresEvent && !eventStore.currentEvent) {
      next('/event-code')
      return
    }

    // Your existing authentication logic
    if (!to.meta.requiresAuth) {
      next()
      return
    }

    const user = await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (authUser) => {
          unsubscribe()
          resolve(authUser)
        },
        () => {
          unsubscribe()
          resolve(null)
        }
      )
    })

    if (user) {
      next()
      return
    }

    next({ path: '/sign-in', query: { redirect: to.fullPath } })
  })

  return Router
})