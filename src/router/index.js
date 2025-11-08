import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'
import routes from './routes'
import { auth } from 'boot/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useEventStore } from 'stores/event-store'
import { getDoc, doc } from 'firebase/firestore'
import { db } from 'boot/firebase'

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
  const createHistory = process.env.SERVER ? createMemoryHistory : createWebHistory

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
      // Check if profile is complete (skip for onboarding pages)
      if (to.path !== '/profile-onboarding' && to.path !== '/user-onboarding') {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (!userData.profileComplete && !userData.firstName) {
            next('/profile-onboarding')
            return
          }
        }
      }

      next()
      return
    }

    next({ path: '/sign-in', query: { redirect: to.fullPath } })
  })

  return Router
})
