<template>
    <div class="min-h-screen bg-[radial-gradient(circle_at_top,#14532d,#052e16)]">
        <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-3xl font-bold mb-8">{{ headingTitle }}</h1>

         <div v-if="selectedUser" class="space-y-6">
             <Card class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
                 <CardHeader>
                     <CardTitle>Account Information</CardTitle>
                 </CardHeader>
                 <CardContent class="space-y-4">
                     <div class="flex flex-col items-center gap-2">
                         <span class="text-sm font-semibold text-black">Profile Picture</span>
                         <Avatar class="w-32 h-32 ring-2 ring-primary">
                         <AvatarImage
                             v-if="selectedUser.photo_avatar_filename"
                             :src="`${serverBaseURL}/storage/photos/${selectedUser.photo_avatar_filename}`"
                         />
                         <AvatarFallback class="text-4xl">
                             {{ selectedUser.name?.charAt(0).toUpperCase() }}
                         </AvatarFallback>
                         </Avatar>
                     </div>
                    <div class="space-y-1">
                        <Label for="name">Name</Label>
                        <p class="bg-white/60 border border-yellow-800/20 rounded-lg px-3 py-2 text-black font-semibold">
                            {{ selectedUser.name || '—' }}
                        </p>
                    </div>
                    <div class="space-y-1">
                        <Label for="nickname">Nickname</Label>
                        <p class="bg-white/60 border border-yellow-800/20 rounded-lg px-3 py-2 text-black font-semibold">
                            {{ selectedUser.nickname || '—' }}
                        </p>
                    </div>
                    <div class="space-y-1">
                        <Label for="email">Email</Label>
                        <p class="bg-white/60 border border-yellow-800/20 rounded-lg px-3 py-2 text-black font-semibold break-all">
                            {{ selectedUser.email || '—' }}
                        </p>
                    </div>
                    <div class="space-y-1">
                        <Label for="coin">Coins</Label>
                        <p class="bg-white/60 border border-yellow-800/20 rounded-lg px-3 py-2 text-black font-semibold">
                            {{ selectedUser.coins ?? 0 }}
                        </p>
                    </div>
                 </CardContent>
             </Card>
         </div>
        <div v-if="canDelete" class="mt-6 items-center justify-center flex">
            <Button @click="showDeleteModal = true"> Delete Account </Button>
        </div>  
        
        <transition name="fade">
        <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl p-6 w-96 max-w-full shadow-lg">
            <h2 class="text-xl font-bold mb-4">Confirm Account Deletion</h2>
            <p class="mb-4">Please, insert your password to confirm the account deletion:</p>
            <input 
              type="password" 
              v-model="deletePassword" 
              class="w-full p-2 border rounded mb-4" 
              placeholder="Password" 
            />
            <div class="flex justify-end gap-2">
              <Button @click="confirmDelete" variant="destructive">Confirm</Button>
              <Button @click="closeDeleteModal" variant="ghost">Cancel</Button>
            </div>
          </div>
        </div>
      </transition>
        
    </div>
    </div>
</template>

<script setup>
import { ref, inject, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAPIStore } from '@/stores/api'
import { toast } from 'vue-sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const authStore = useAuthStore()
const apiStore = useAPIStore()
const router = useRouter()
const route = useRoute()

const showDeleteModal = ref(false)
const deletePassword = ref('')
const selectedUser = ref(null)
const headingTitle = computed(() => {
    const name = selectedUser.value?.name
    return name ? `${name}'s Profile` : 'User Profile'
})

const serverBaseURL = inject("serverBaseURL")

const canDelete = computed(() => {
    return authStore.currentUser?.type !== 'A'
})

const closeDeleteModal = () => {
    deletePassword.value = ''
    showDeleteModal.value = false
}

const confirmDelete = async () => {
    if (!deletePassword.value) {
        toast.error("Por favor, insira a password")
        return
    }

    const passwordOk = await apiStore.verifyPassword(authStore.currentUser.id, deletePassword.value)
    if (!passwordOk) {
        toast.error("Password incorreta")
        closeDeleteModal()
        return
    }

    try {
        await apiStore.deleteUser(authStore.currentUser.id)
        toast.success("Profile deleted successfully")
        closeDeleteModal()
        authStore.currentUser = undefined
        await router.push({ name: 'home' })
    } catch (error) {
        console.error('Failed to delete profile:', error)
        toast.error("Failed to delete profile. Please try again.")
        closeDeleteModal()
    }
}

const loadUser = async (id) => {
  if (!id) {
    selectedUser.value = null
    return
  }
  const response = await apiStore.getUser(id)
  selectedUser.value = response.data?.data ?? response.data
}

watch(
  () => route.query.userId,
  (id) => loadUser(Number(id)),
  { immediate: true }
)

onMounted(() => loadUser(Number(route.query.userId)))

</script>


<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>