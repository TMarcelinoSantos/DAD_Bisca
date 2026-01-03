<template>
    <div class="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center px-3 sm:px-6 pb-6 pt-20 sm:pt-24 bg-transparent">
    <div class="fixed inset-0 -z-10 pointer-events-none">
              <Balatro
                :is-rotate="false"
                :mouse-interaction="false"
                :pixel-filter="700"
                :color1 = "'#5CA173'"
                :color2 = "'#0D5E1C'"
              />
            </div>
      <div class="w-full max-w-md sm:max-w-2xl bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">    
      <div class="text-center mb-6">
        <h1 class="text-2xl sm:text-4xl font-bold text-yellow-800 tracking-[0.18em] sm:tracking-[0.4em] uppercase drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] mb-3 sm:mb-4">
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

            <Label class="block text-left text-gray-700 dark:text-gray-300 mb-2" for="photo">Photo (optional)</Label>
            <div class="flex items-center gap-6 mb-6">
            <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-yellow-700 flex items-center justify-center bg-gray-200">
                <img
                v-if="preview"
                :src="preview"
                class="w-full h-full object-cover"
                />
                <span v-else class="text-3xl text-gray-500">
                {{ formData.nickname?.charAt(0)?.toUpperCase() || '?' }}
                </span>
            </div>

            <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onPhotoChange"
            />

            <!-- Custom button -->
            <Button
                type="button"
                variant="outline"
                @click="fileInput.click()"
            >
                Choose Photo
            </Button>
            </div>
    
            <Button
                class="w-full py-4 text-lg font-semibold bg-black text-white rounded-xl hover:bg-gray-800 transition"
                type="submit"
                > Create Account 
            </Button>
        </form>
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {useAuthStore} from '@/stores/auth'
import {useAPIStore} from '@/stores/api'
import {toast} from 'vue-sonner'
import Balatro from "@/components/ui/Balatro.vue"


const router = useRouter()
const authStore = useAuthStore()
const apiStore = useAPIStore()
const fileInput = ref(null)

const formData = ref({
    nickname: '',
    name: '',
    email: '',
    password: '',
    photo: null
})

const preview = computed(() => {
    return formData.value.photo
        ? URL.createObjectURL(formData.value.photo)
        : null
})

const onPhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
        formData.value.photo = file
    }
}

const registerAccount = async () => {
  try {
    const payload = {
      nickname: formData.value.nickname,
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password
    }

    await toast.promise(
      authStore.register(payload),
      {
        loading: 'Creating account...',
        success: 'Account created successfully!',
        error: 'Failed to create account.'
      }
    )

    await authStore.login({
      email: payload.email,
      password: payload.password
    })

    if (formData.value.photo) {
      const uploadRes = await apiStore.uploadProfilePhoto(formData.value.photo)
      if (uploadRes.data?.filename) {
        await apiStore.patchUserPhoto(
          authStore.currentUser.id,
          { photo_avatar_filename: uploadRes.data.filename }
        )
        await authStore.getUser()
      }
    }

    router.push({ name: 'home' })

  } catch (err) {
    console.error(err)
    toast.error('Failed to create account.')
  }
}


</script>