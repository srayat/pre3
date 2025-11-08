const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: { hideHeader: true, hideBottomNav: true },
      },
      {
        path: 'sign-in',
        component: () => import('pages/SignInPage.vue'),
        meta: { hideBottomNav: true },
      },

      // ========== EVENT FLOW ROUTES ==========

      {
        path: 'event-onboarding/:eventId',
        name: 'event-onboarding',
        component: () => import('pages/EventOnboardingPage.vue'),
        meta: {
          requiresAuth: true,
          requiresEvent: true,
          hideBottomNav: true,
        },
      },
      {
        path: 'investment/:eventId',
        name: 'investment',
        component: () => import('pages/InvestmentPage.vue'),
        meta: {
          requiresAuth: true,
          requiresEvent: true,
          hideBottomNav: true,
        },
      },
      {
        path: 'rate-startup/:eventId/:startupId',
        name: 'rate-startup',
        component: () => import('pages/RateStartupPage.vue'),
        meta: { requiresAuth: true, requiresEvent: true, hideBottomNav: true },
      },

      // ========== OTHER ONBOARDING FLOWS ==========

      {
        path: 'user-onboarding',
        name: 'user-onboarding',
        component: () => import('pages/OnboardingPage.vue'),
        meta: { requiresAuth: true, hideBottomNav: true },
      },
      {
        path: 'profile-onboarding',
        name: 'profile-onboarding',
        component: () => import('pages/OnboardingPage.vue'),
        meta: { requiresAuth: true, hideBottomNav: true },
      },

      // ========== EVENT MANAGEMENT ROUTES ==========

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

      // ========== OTHER PAGES ==========

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
        path: 'add-startup',
        component: () => import('pages/AddStartupPage.vue'),
        meta: { requiresAuth: true, hideBottomNav: true },
      },
    ],
  },

  // Always leave this last
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
