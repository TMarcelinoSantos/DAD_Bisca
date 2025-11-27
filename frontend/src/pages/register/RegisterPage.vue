<template>
    <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div class="w-full max-w-md space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Create a new account
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    Enter your credentials to register your account
                </p>
            </div>

            <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
                <div class="space-y-4 rounded-md shadow-sm">

                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <Input id="name" v-model="formData.name" type="text" autocomplete="name" required
                            placeholder="John Doe" />
                    </div>

                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <Input id="username" v-model="formData.username" type="text" autocomplete="username" required
                            placeholder="biscateEnjoyer123" />
                    </div>

                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                            Email address
                        </label>
                        <Input id="email" v-model="formData.email" type="email" autocomplete="email" required
                            placeholder="you@example.com" />
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <Input id="password" v-model="formData.password" type="password" autocomplete="current-password"
                            required placeholder="•••" />
                    </div>
                </div>


                <div>
                    <Button type="submit" class="w-full"> Sign up </Button>
                </div>

                <div class="text-center text-sm">
                    <span class="text-gray-600">Already have an account? </span>
                    <a href="../login" class="font-medium text-blue-600 hover:text-blue-500">
                        Login In
                    </a>
                </div>
            </form>
        </div>
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
    name: '',
    username: '',
    email: '',
    password: ''
})


const handleSubmit = async () => {

    toast.promise(authStore.login(formData.value), {
        loading: 'Calling API',
        success: (data) => {
            return `Login Sucessfull - ${data?.name}`
        },
        error: (data) => `[API] Error signing in - ${data?.response?.data?.message}`,
    })


    router.push('/')
}
</script>
