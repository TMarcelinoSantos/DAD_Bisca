<template>
    <div class="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center px-3 sm:px-6 pb-6 pt-20 sm:pt-24 bg-[radial-gradient(circle_at_top,#14532d,#052e16)]">
    <div class="w-full max-w-md sm:max-w-2xl bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">    
      <div class="text-center mb-6">
        <h1 class="text-2xl sm:text-4xl font-bold text-yellow-200 tracking-[0.18em] sm:tracking-[0.4em] uppercase drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] mb-3 sm:mb-4">
          Bisca(Te)
        </h1>
        <p class="text-sm font-bold fill-yellow-600 tracking-widest">Create your account to get started!</p>
      </div>

        <form @submit.prevent="registerAccount">

            <Label class="block text-left text-gray-700 dark:text-gray-300 mb-2" for="nickname">Nickname</Label>
            <Input
                id="nickname"
                type="text"
                autocomplete="nickname"
                v-model ="formData.nickname"
                class="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your nickname"
                required
            />
    
            <Label class="block text-left text-gray-700 dark:text-gray-300 mb-2" for="name">Name</Label>
            <Input
                id="name"
                type="text"
                autocomplete="name"
                v-model ="formData.name"
                class="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your name"
                required
            />
    
            <Label class="block text-left text-gray-700 dark:text-gray-300 mb-2" for="email">Email</Label>
            <Input
                id="email"
                type="email"
                autocomplete="email"
                v-model ="formData.email"
                class="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="example@mail.com"
                required
            />
    
            <Label class="block text-left text-gray-700 dark:text-gray-300 mb-2" for="password">Password</Label>
            <Input
                id="password"
                type="password"
                v-model ="formData.password"
                class="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your password"
                required
            />
    
            <Button
                class="w-full py-4 text-lg font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                type="submit"
                > Create Account 
            </Button>
        </form>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {useAuthStore} from '@/stores/auth'
import {toast} from 'vue-sonner'


const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
    nickname: '',
    name: '',
    email: '',
    password: ''
})


const registerAccount = () => {
    toast.promise(authStore.register(formData.value),{
        loading: 'Creating account...',
        success: 'Account created successfully!',
        error: 'Failed to create account.'
    })
    router.push({name: 'login'})
}
</script>