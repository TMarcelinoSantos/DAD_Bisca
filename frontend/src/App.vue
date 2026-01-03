<template>
  <Toaster />
  <nav
    class="max-w-full p-5 flex flex-row justify-between items-center bg-gradient-to-r from-emerald-950 via-emerald-850 to-emerald-800 text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] border-b-[2px] border-black"
  >
    <div class="flex items-center gap-2 text-xl">
      <RouterLink to="/" class="inline-flex items-center">
        <img src="/logo.png" alt="Bisca(te) logo" class="h-10 w-auto rounded-full border-2 border-amber-100" />
        <span class="ml-2 font-bold text-2xl text-amber-100 hover:text-white">Bisca(te)</span>
      </RouterLink>
    </div>
    <NavigationMenu>
      <NavigationMenuList class="justify-around gap-6 text-amber-100">
        <!-- Platform stats - always visible -->
        <NavigationMenuItem>
          <NavigationMenuLink
            class="text-amber-100 bg-emerald-950 border border-amber-100 hover:text-white hover:bg-white/10"
          >
            <RouterLink to="/statistics" class="hover:text-amber-200">Statistics</RouterLink>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            class="text-amber-100 bg-emerald-950 border border-amber-100 hover:text-white hover:bg-white/10"
          >
            <RouterLink to="/leaderboards" class="hover:text-amber-200">Global leaderboard</RouterLink>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <!-- AUTH-DEPENDENT ITEMS -->
        <template v-if="!authStore.isLoggedIn">
          <!-- LOGIN BUTTON -->
          <NavigationMenuItem>
            <NavigationMenuLink
              class="text-amber-100 bg-emerald-950 border border-amber-100 hover:text-white hover:bg-white/10"
            >
              <RouterLink to="/login" class="hover:text-amber-200">Login</RouterLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </template>

        <template v-else>
          <!-- APP MANAGEMENT FOR ADMINS -->
          <NavigationMenuItem v-if="authStore.isAdmin">
            <NavigationMenuLink
              class="text-amber-100 bg-emerald-950 border border-amber-100 hover:text-white hover:bg-white/10"
            >
              <RouterLink to="/appManagement" class="hover:text-amber-200">App Management</RouterLink>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <!-- USER MENU -->
          <NavigationMenuItem class="flex items-center gap-4">
            <template v-if="!authStore.isAdmin">
              <span
                class="inline-flex items-center gap-1 rounded-full border border-amber-200/30 bg-amber-100/10 px-3 py-1 text-sm text-amber-50"
              >
                {{ authStore.currentUser?.coins_balance ?? 0 }} 🪙
              </span>
            </template>

            <NavigationMenuTrigger
              class="text-amber-100 bg-emerald-950 border border-amber-100 hover:text-white hover:bg-white/10"
            >
              <img
                :src="
                  authStore.currentUser?.photo_avatar_filename
                    ? `${serverBaseURL}/storage/photos/${authStore.currentUser.photo_avatar_filename}`
                    : '/default-avatar.png'
                "
                alt="User Avatar"
                class="inline-block h-6 w-6 rounded-full mr-2"
              />
              {{ authStore.currentUser?.nickname || authStore.currentUser?.name }}
            </NavigationMenuTrigger>

            <NavigationMenuContent
              sideOffset="8"
              class="bg-emerald-950/95 text-amber-100 border border-amber-400/30 shadow-2xl"
            >
              <ul class="flex flex-col gap-1 px-4 py-2">
                <li>
                  <NavigationMenuLink as-child>
                    <RouterLink to="/profile" class="hover:text-black">Profile</RouterLink>
                  </NavigationMenuLink>
                </li>
                <li v-if="!authStore.isAdmin">
                  <NavigationMenuLink as-child>
                    <RouterLink to="/store" class="hover:text-black">Store</RouterLink>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink as-child>
                    <RouterLink to="/coinshistory" class="hover:text-black">Transactions</RouterLink>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink as-child>
                    <RouterLink to="/history" class="hover:text-black">History</RouterLink>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink as-child>
                    <RouterLink to="/leaderboard" class="hover:text-black">Leaderboard</RouterLink>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink as-child>
                    <a @click.prevent="logout" class="cursor-pointer hover:text-black">Logout</a>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </template>
      </NavigationMenuList>
    </NavigationMenu>
  </nav>
  <div>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'vue-sonner'
import 'vue-sonner/style.css'
import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { onMounted, inject } from 'vue';   // ← add inject
import { useSocketStore } from './stores/socket';

import {useRouter} from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const socketStore = useSocketStore()

const serverBaseURL = inject('serverBaseURL')

const logout = () => {
  toast.promise(authStore.logout(), {
    loading: 'Calling API',
    success: () => {
      return 'Logout Sucessfull '
    },
    error: (data) => `[API] Error saving game - ${data?.response?.data?.message}`,
  })

  router.push({ name: 'home' })
}

onMounted(() => {
  socketStore.handleConnection()
  socketStore.handleGameEvents()
})

</script>

<style></style>
