import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/home/HomePage.vue'
import AboutPage from '@/pages/about/AboutPage.vue'
import LoginPage from '@/pages/login/LoginPage.vue'
import RegisterPage from '@/pages/register/RegisterPage.vue'
import ProfilePage from '@/pages/profile/ProfilePage.vue'
import StorePage from '@/pages/store/Store.vue'
import CoinsHistoryPage from '@/pages/store/HistoryCoins.vue'
import SinglePlayerGamePage from '../pages/game/SinglePlayerGamePage.vue'
import SinglePlayerMatchesPage from '../pages/game/SinglePlayerMatchesPage.vue'
import HistoryPage from '@/pages/history/HistoryPage.vue'
import AppManagement from '@/pages/admin/AppManagement.vue'
import AdminProfilePage from '@/pages/admin/AdminProfilePage.vue'
import { useAuthStore } from '@/stores/auth'
import MultiPlayerGamePage from '@/pages/game/MultiPlayerGamePage.vue'
import MultiPlayerMatchPage from '@/pages/game/MultiPlayerMatchesPage.vue'

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
        {
          path: 'multiplayergame',
          name: 'multiplayergame',
          component: MultiPlayerGamePage,
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
        {
          path: 'multiplayermatches',
          name: 'multiplayermatches',
          component: MultiPlayerMatchPage,
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
      path: '/coinshistory',
      name: 'coinshistory',
      component: CoinsHistoryPage,
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
      meta: { requiresAuth: true },
    },
    {
      path: '/history/match/:matchId',
      name: 'matchDetails',
      component: () => import('@/pages/history/MatchDetailsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: () => import('@/pages/leaderboard/PersonalLeaderboardPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/leaderboards',
      name: 'globalLeaderboard',
      component: () => import('@/pages/leaderboard/GlobalLeaderboardPage.vue'),
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('@/pages/statistics/StatisticsPage.vue'),
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
    },
    {
      path: '/admin/statistics',
      name: 'adminStatistics',
      component: () => import('@/pages/statistics/AdminStatsPage.vue'),
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
