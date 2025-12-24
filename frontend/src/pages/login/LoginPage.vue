<template>
  <div class="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center px-3 sm:px-6 pb-6 pt-20 sm:pt-24 bg-[radial-gradient(circle_at_top,#14532d,#052e16)]">
    <div class="w-full max-w-md sm:max-w-2xl bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">    
      <div class="text-center mb-6">
        <h1 class="text-2xl sm:text-4xl font-bold text-yellow-200 tracking-[0.18em] sm:tracking-[0.4em] uppercase drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] mb-3 sm:mb-4">
          Bisca(Te)
        </h1>
        <p class="text-sm font-bold fill-yellow-600 tracking-widest">Sign in to your account</p>
      </div>
      
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <br>
          <label for="email" class="block text-sm font-medium text-yellow-700 mb-1">
            Email address
          </label>
          <Input
            id="email"
            v-model="formData.email"
            type="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
            class="w-full h-14 px-4 text-lg font-semibold rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-yellow-700 mb-1">
            Password
          </label>
          <Input
            id="password"
            v-model="formData.password"
            type="password"
            autocomplete="current-password"
            required
            placeholder="•••"
            class="w-full h-14 px-4 text-lg font-semibold rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div>
          <Button
            type="submit"
            class="w-full h-14 px-4 text-lg font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            Sign in
          </Button>
        </div>

        <div class="text-center text-sm mt-4">
          <span class="text-yellow-600">Don't have an account? </span>
          <a href="../register" class="font-medium text-blue-600 hover:text-blue-500">
            Create account
          </a>
          
        </div>
      </form>
    </div>

    <button
      class="w-full max-w-sm py-4 text-lg font-semibold border border-gray-300 rounded-xl mt-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      @click="goBack"
    >
      Go back
    </button>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const authStore = useAuthStore()
const router = useRouter()

const formData = ref({
    email: '',
    password: ''
})


const handleSubmit = async () => {

  await toast.promise(
      authStore.login(formData.value),
      {
        loading: 'Logging in...',
        success: (data) => {
          router.push({ name: 'home' })     // redirect
          return 'Login successful!'                 // toast message
        },
        error: 'Failed to login',
      }
    )
  
}

const goBack = () => {
  router.push({ name: 'home' })
}
</script>
