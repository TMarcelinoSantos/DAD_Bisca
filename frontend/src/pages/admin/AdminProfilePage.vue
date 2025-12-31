<template>
    <div class="min-h-screen bg-transparent relative overflow-hidden">
        <div class="fixed inset-0 -z-10 pointer-events-none">
            <Balatro
              :is-rotate="false"
              :mouse-interaction="false"
              :pixel-filter="700"
              :color1 = "'#5CA173'"
              :color2 = "'#0D5E1C'"
            />
          </div>
        <div class="max-w-4xl mx-auto p-6">
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
                    <div class="space-y-1">
                        <Label for="coin">Type</Label>
                        <div class="flex items-center gap-3">
                            <p class="flex-1 min-w-0 bg-white/60 border border-yellow-800/20 rounded-lg px-3 py-2 text-black font-semibold">
                                 {{
                                 selectedUser.type === 'A'
                                     ? 'Administrator'
                                     : selectedUser.type === 'P'
                                     ? 'Player'
                                     : '—'
                                 }}
                            </p>
                            <Button v-if="selectedUser.type === 'P'" class="hover:bg-blue-700" @click="promoteToAdmin"> Promote to Administrator </Button>
                        </div>
                    </div>
                    <div v-if="selectedUser.type === 'P'" class="space-y-1">
                        <Label for="blocked">State</Label>
                        <div class="flex items-center gap-3">
                            <p class="flex-1 min-w-0 bg-white/60 border border-yellow-800/20 rounded-lg px-3 py-2 text-black font-semibold">
                                 {{ selectedUser.blocked ? 'Blocked' : 'Unblocked' }}
                            </p>
                            <!--BLOCK/UNBLOCK BUTTON-->
                            <Button v-if="!selectedUser.blocked" class="hover:bg-red-700" @click="blockUser"> Block User </Button>
                            <Button v-else class="hover:bg-emerald-700" @click="unblockUser"> Unblock User </Button>
                        </div>
                    </div>
                 </CardContent>
                    <div class="mt-6 items-center justify-center flex">
                        <!--DELETE BUTTON-->
                        <Button class="hover:bg-red-700" @click="showDeleteModal = true"> Delete Account </Button>
                    </div> 
             </Card>
         </div>
        
        <transition name="fade">
        <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl p-6 w-96 max-w-full shadow-lg">
            <h2 class="text-xl font-bold mb-4">Confirm Account Deletion</h2>
            <div class="flex justify-center gap-10">
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
import { useAPIStore } from '@/stores/api'
import { toast } from 'vue-sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Balatro from "@/components/ui/Balatro.vue"

const apiStore = useAPIStore()
const router = useRouter()
const route = useRoute()

const showDeleteModal = ref(false)
const selectedUser = ref(null)

const serverBaseURL = inject("serverBaseURL")

const closeDeleteModal = () => {
    showDeleteModal.value = false
}

const blockUser = async () => {
    try {
        await apiStore.blockUser(selectedUser.value.id)
        toast.success("User blocked successfully")
        await loadUser(selectedUser.value.id)
    } catch (error) {
        toast.error("Failed to block user.")
    }
}

const unblockUser = async () => {
    try {
        await apiStore.unblockUser(selectedUser.value.id)
        toast.success("User unblocked successfully")
        await loadUser(selectedUser.value.id)
    } catch (error) {
        toast.error("Failed to unblock user.")
    }
}

const promoteToAdmin = async () => {
    try {
        await apiStore.patchUserType(selectedUser.value.id, 'A')
        toast.success("User promoted to administrator successfully")
        await loadUser(selectedUser.value.id)
    } catch (error) {
        toast.error("Failed to promote user.")
    }
}

const confirmDelete = async () => {
    try {
        await apiStore.deleteUser(selectedUser.value.id)
        toast.success("Profile deleted successfully")
        await router.push({ name: 'appManagement' })
    } catch (error) {
        console.error('Failed to delete profile:', error)
        toast.error("Failed to delete profile.")
    } finally {
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