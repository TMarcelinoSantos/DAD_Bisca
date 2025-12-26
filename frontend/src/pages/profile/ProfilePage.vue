<template>
    <div class="min-h-screen bg-[radial-gradient(circle_at_top,#14532d,#052e16)]">
        <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-3xl font-bold mb-8">My Profile</h1>

        <div v-if="authStore.currentUser" class="space-y-6">
            <Card class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
                <CardHeader>
                    <CardTitle>Profile Photo</CardTitle>
                    <CardDescription>Update your profile picture</CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="flex flex-col sm:flex-row items-start gap-6">
                        <div class="flex flex-row gap-6 items-center">
                            <div class="flex flex-col items-center gap-2">
                                <span class="text-sm text-muted-foreground">Current</span>
                                <Avatar class="w-32 h-32 ring-2 ring-primary">
                                <AvatarImage
                                    v-if="authStore.currentUser.photo_avatar_filename"
                                    :src="`${serverBaseURL}/storage/photos/${authStore.currentUser.photo_avatar_filename}`"
                                />
                                <AvatarFallback class="text-4xl">
                                    {{ authStore.currentUser.name?.charAt(0).toUpperCase() }}
                                </AvatarFallback>
                                </Avatar>
                            </div>

                            <div v-if="preview" class="flex flex-col items-center gap-2">
                                <span class="text-sm text-muted-foreground">New</span>
                                <Avatar class="w-32 h-32 ring-2 ring-primary">
                                <AvatarImage :src="preview" />
                                </Avatar>
                            </div>
                        </div>

                        <div class="flex-1 space-y-3">
                            <div class="flex flex-wrap gap-2">
                                <Button @click="open" variant="outline">
                                    Choose Photo
                                </Button>
                                <Button v-if="files" @click="uploadPhoto">Save Photo</Button>
                                <Button v-if="files" @click="reset" variant="ghost">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div class="space-y-2">
                        <Label for="name">Name</Label>
                        <Input class="bg-white/70" id="name" v-model="formData.name" placeholder="Enter your name" />
                    </div>
                    <div class="space-y-2">
                        <Label for="nickname">Nickname</Label>
                        <Input class="bg-white/70" id="nickname" v-model="formData.nickname" placeholder="Enter your nickname" />
                    </div>
                    <div class="space-y-2">
                        <Label for="email">Email</Label>
                        <Input class="bg-white/70" id="email" v-model="formData.email" type="email" placeholder="Enter your email" />
                    </div>
                    <div class="space-y-2">
                        <Label for="password">Password</Label>
                        <Input class="bg-white/70" id="password" v-model="formData.password" placeholder="Change your password" />
                    </div>
                </CardContent>
                <CardFooter class="flex justify-between">
                    <Button @click="saveProfile"> Save Changes </Button>
                </CardFooter>
            </Card>
        </div>
    </div>
    </div>
</template>

<script setup>
import { ref, inject, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAPIStore } from '@/stores/api'
import { useFileDialog } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const authStore = useAuthStore()
const apiStore = useAPIStore()

const serverBaseURL = inject("serverBaseURL")

const formData = ref({
    name: '',
    nickname: '',
    email: '',
    password: '',
})

watch(() => authStore.currentUser, (user) => {
    if (user) {
        formData.value = {
            name: user.name || '',
            nickname: user.nickname || '',
            email: user.email || '',
            password: user.password || ''
        }
    }
}, { immediate: true })

const { files, open, reset } = useFileDialog({
    accept: 'image/*',
    multiple: false
})

const preview = computed(() =>
  files.value?.[0] ? URL.createObjectURL(files.value[0]) : null
)


const uploadPhoto = async () => {

    try {
        const response = await apiStore.uploadProfilePhoto(files.value[0])

        if (response.data && response.data.filename) {
            const filename = response.data.filename
            await apiStore.patchUserPhoto(authStore.currentUser.id, {photo_avatar_filename: filename})
            await authStore.getUser()

            toast.success("Profile photo updated successfully")

            reset()
        }
    } catch (error) {
        console.error('Failed to upload photo:', error)
        toast.error("Failed to upload photo. Please try again.")
    }
}

const saveProfile = async () => {

    try {

        const user = Object.assign({}, authStore.currentUser)

        user.name = formData.value.name
        user.nickname = formData.value.nickname
        user.email = formData.value.email
        user.password = formData.value.password

        await apiStore.putUser(user)
        await authStore.getUser()
        toast.success("Profile updated successfully")

    } catch (error) {
        console.error('Failed to update profile:', error)
        toast.error("Failed to update profile. Please try again.")
    }
}
</script>
