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
      <NavigationMenuList class="justify-around gap-20 text-amber-100">
        <NavigationMenuItem v-if="!authStore.isLoggedIn">
          <NavigationMenuLink class="text-amber-100 hover:text-white">
            <RouterLink to="/login" class="hover:text-amber-200">Login</RouterLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem v-else class ="flex">
          <span
            class="inline-flex items-center gap-1 rounded-full border border-amber-200/30 bg-amber-100/10 px-3 py-1 mx-5 text-sm text-amber-50"
          >
            {{ authStore.currentUser?.coins_balance ?? 0 }} 🪙
          </span>
          <NavigationMenuTrigger class="text-amber-100 bg-emerald-950 hover:text-white hover:bg-white/10">
            <img
              :src="authStore.currentUser?.avatar || '/default-avatar.png'"
              alt="User Avatar"
              class="inline-block h-6 w-6 rounded-full mr-2"
            />
            {{ authStore.currentUser?.nickname }}</NavigationMenuTrigger>
          <NavigationMenuContent class="bg-emerald-950/95 text-amber-100 border border-amber-400/30 shadow-2xl">
            <li>
              <NavigationMenuLink as-child>
                <RouterLink to="/profile" class="hover:text-black">Profile</RouterLink>
              </NavigationMenuLink>
              <NavigationMenuLink as-child>
                <RouterLink to="/store" class="hover:text-black">Store</RouterLink>
              </NavigationMenuLink>
              <NavigationMenuLink as-child>
                <a @click.prevent="logout" class="cursor-pointer hover:text-black">Logout</a>
              </NavigationMenuLink>
            </li>
          </NavigationMenuContent>
        </NavigationMenuItem>
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
const authStore = useAuthStore()

const logout = () => {
  toast.promise(authStore.logout(), {
    loading: 'Calling API',
    success: () => {
      return 'Logout Sucessfull '
    },
    error: (data) => `[API] Error saving game - ${data?.response?.data?.message}`,
  })
}

</script>

<style></style>
