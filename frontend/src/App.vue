<template>
  <Toaster />
  <nav
    class="max-w-full p-5 flex flex-row justify-between items-center bg-gradient-to-r from-emerald-950 via-emerald-850 to-emerald-800 text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] border-b-[2px] border-black"
  >
    <div class="flex items-center gap-2 text-xl">
      <RouterLink to="/" class="inline-flex items-center">
        <img src="/logo.png" alt="Bisca(te) logo" class="h-10 w-auto rounded-full" />
      </RouterLink>
      <span class="text-xs" v-if="authStore.currentUser">&nbsp;&nbsp;&nbsp;
            ({{ authStore.currentUser?.name }})
      </span>
    </div>
    <NavigationMenu>
      <NavigationMenuList class="justify-around gap-20 text-amber-100">
        <NavigationMenuItem>
          <NavigationMenuTrigger class="text-amber-100 hover:text-white hover:bg-white/10">Games</NavigationMenuTrigger>
          <NavigationMenuContent class="bg-emerald-950/95 text-amber-100 border border-amber-400/30 shadow-2xl">
            <li>
              <NavigationMenuLink as-child>
                <RouterLink to="/games/singleplayer" class="hover:text-amber-200">SinglePlayer</RouterLink>
              </NavigationMenuLink>
              <NavigationMenuLink as-child>
                <RouterLink to="/" class="hover:text-amber-200">MultiPlayer</RouterLink>
              </NavigationMenuLink>
            </li>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink class="text-amber-100 hover:text-white">
            <RouterLink to="/about" class="hover:text-amber-200">About</RouterLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem v-if="!authStore.isLoggedIn">
          <NavigationMenuLink class="text-amber-100 hover:text-white">
            <RouterLink to="/login" class="hover:text-amber-200">Login</RouterLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem v-else>
          <NavigationMenuTrigger class="text-amber-100 hover:text-white hover:bg-white/10">Account</NavigationMenuTrigger>
          <NavigationMenuContent class="bg-emerald-950/95 text-amber-100 border border-amber-400/30 shadow-2xl">
            <li>
              <NavigationMenuLink as-child>
                <RouterLink to="/profile" class="hover:text-amber-200">Profile</RouterLink>
              </NavigationMenuLink>
              <NavigationMenuLink as-child>
                <RouterLink to="/store" class="hover:text-amber-200">Store</RouterLink>
              </NavigationMenuLink>
              <NavigationMenuLink as-child>
                <a @click.prevent="logout" class="cursor-pointer hover:text-amber-200">Logout</a>
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
