import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/home/HomePage.vue'
import AboutPage from '@/pages/about/AboutPage.vue'
import LoginPage from '@/pages/login/LoginPage.vue'
import RegisterPage from '@/pages/register/RegisterPage.vue'
import SinglePlayerGamePage from '../pages/game/SinglePlayerGamePage.vue'

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
      path: '/about',
      name: 'about',
      component: AboutPage,
    },
  ],
})

export default router
