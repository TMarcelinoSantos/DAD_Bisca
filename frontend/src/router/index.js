import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/home/HomePage.vue'
import AboutPage from '@/pages/about/AboutPage.vue'
import LoginPage from '@/pages/login/LoginPage.vue'
import RegisterPage from '@/pages/register/RegisterPage.vue'
import ProfilePage from '@/pages/profile/ProfilePage.vue'
import SinglePlayerGamePage from '../pages/game/SinglePlayerGamePage.vue'
import SinglePlayerMatchesPage from '../pages/game/SinglePlayerMatchesPage.vue'
import AppManagement from '@/pages/admin/AppManagement.vue'
import AdminProfilePage from '@/pages/admin/AdminProfilePage.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/games',
      children: [
        {
          path: 'singleplayer',
          name: 'singleplayer',
          component: SinglePlayerGamePage,
        },
      ],
    },
    {
      path: '/matches',
      children: [
        {
          path: 'singlematches',
          name: 'singlematches',
          component: SinglePlayerMatchesPage,
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfilePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: AboutPage,
    },
    {
      path: '/appManagement',
      name: 'appManagement',
      component: AppManagement,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/adminProfile',
      name: 'adminProfile',
      component: AdminProfilePage,
      meta: { requiresAuth: true, requiresAdmin: true },
    }
  ],
})

// navigation guard: redirect to login if route requires auth and user not authenticated
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.matched.some(record => record.meta?.requiresAuth)) {
    if (!auth.isLoggedIn) {
      return next({ name: 'login' })
    }
  }

  if (to.matched.some(record => record.meta?.requiresAdmin)) {
    if (!auth.isAdmin) {
      return next({ name: 'home' })
    }
  }

  next()
})

export default router
