import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/home/HomePage.vue'
import AboutPage from '@/pages/about/AboutPage.vue'
import LoginPage from '@/pages/login/LoginPage.vue'
import RegisterPage from '@/pages/register/RegisterPage.vue'
import ProfilePage from '@/pages/profile/ProfilePage.vue'
import StorePage from '@/pages/store/Store.vue'
import PaymentPage from '@/pages/store/Payment.vue'
import SinglePlayerGamePage from '../pages/game/SinglePlayerGamePage.vue'
import SinglePlayerMatchesPage from '../pages/game/SinglePlayerMatchesPage.vue'
import HistoryPage from '@/pages/history/HistoryPage.vue'
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
      path: '/store',
      name: 'store',
      component: StorePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/payment',
      name: 'payment',
      component: PaymentPage,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutPage,
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryPage,
    },
    {
      path: '/history/match/:matchId',
      name: 'matchDetails',
      component: () => import('@/pages/history/MatchDetailsPage.vue'),
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: () => import('@/pages/leaderboard/PersonalLeaderboardPage.vue'),
    },
    {
      path: '/leaderboards',
      name: 'globalLeaderboard',
      component: () => import('@/pages/leaderboard/GlobalLeaderboardPage.vue'),
    },
  ],
})

// navigation guard: redirect to login if route requires auth and user not authenticated
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.matched.some((record) => record.meta?.requiresAuth)) {
    if (auth.isLoggedIn) {
      return next()
    }
    return next({ name: 'login' })
  }
  next()
})

export default router
