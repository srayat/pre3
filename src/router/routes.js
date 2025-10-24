const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: { hideBottomNav: true },
      },
      {
        path: 'sign-in',
        component: () => import('pages/SignInPage.vue'),
        meta: { hideBottomNav: true },
      },
      {
        path: 'onboarding',
        component: () => import('pages/OnboardingPage.vue'),
        meta: { requiresAuth: true, hideBottomNav: true },
      },
      {
        path: 'home',
        component: () => import('pages/HomePage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'notifications',
        component: () => import('pages/NotificationsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'more',
        component: () => import('pages/MorePage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'events',
        component: () => import('pages/MyEventsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'events/new',
        component: () => import('pages/EventCreatePage.vue'),
        meta: { requiresAuth: true, hideBottomNav: true },
      },
      {
        path: 'events/:eventId',
        component: () => import('pages/EventManagePage.vue'),
        meta: { requiresAuth: true, hideBottomNav: true },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
