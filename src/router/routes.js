import { ownerGuard } from './guards/ownerGuard'

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
      
      // ========== EVENT FLOW ROUTES (NEW) ==========
      {
        path: 'onboarding',
        name: 'onboarding',
        component: () => import('pages/EventOnboardingPage.vue'),
        meta: { 
          requiresAuth: true, 
          requiresEvent: true,  // ← NEW: Needs active event
          hideBottomNav: true 
        },
      },
      {
        path: 'investment',
        name: 'investment', 
        component: () => import('pages/InvestmentPage.vue'),
        meta: { 
          requiresAuth: true, 
          requiresEvent: true,  // ← NEW: Needs active event
          hideBottomNav: true 
        },
      },
      // ========== END EVENT FLOW ROUTES ==========

      {
        path: 'onboarding',
        component: () => import('pages/OnboardingPage.vue'),
        meta: { requiresAuth: true, hideBottomNav: true },
      },

      {
        path: 'rate-startup/:startupId',
        component: () => import('pages/RateStartupPage.vue'),
        meta: { requiresAuth: true, requiresEvent: true }
      },

      {
        path: 'rate-startup/:startupId',
        name: 'rate-startup',
        component: () => import('pages/RateStartupPage.vue'),
        meta: { 
          requiresAuth: true, 
          requiresEvent: true,
          hideBottomNav: true 
        },
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
        path: 'add-startup',
        component: () => import('pages/AddStartupPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/startup/:id/edit',
        name: 'EditStartupPage',
        component: () => import('pages/EditStartupPage.vue'),
        meta: { requiresAuth: true }
      },

      {
        path: '/startup/:id',
        name: 'StartupDetailPage',
        component: () => import('pages/StartupDetailPage.vue'),
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
      {
        path: '/startup/:id/edit',
        name: 'EditStartupPage',
        component: () => import('pages/EditStartupPage.vue'),
        beforeEnter: ownerGuard,
        meta: { requiresAuth: true }
      }
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