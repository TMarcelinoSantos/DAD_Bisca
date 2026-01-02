import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAPIStore } from './api'
import { useAuthStore } from './auth'

export const useCostumizationsStore = defineStore('costumizations', () => {
    const backCard = ref()
    const api = useAPIStore()
    const auth = useAuthStore()

    const loadImagesBack = () => {
        const modules = import.meta.glob('../cards/*.{png,jpg,jpeg}', { eager: true })
        const imgs = Object.entries(modules)
            .map(([path, mod]) => {
                const file = path.split('/').pop()
                const id = file.replace(/\.[^/.]+$/, '')
                const src = mod.default
                return {path, id, src }
            })
            .filter(i => /semFace/i.test(i.path))
            .map(i => ({ id: i.id, src: i.src }))

            backCard.value = imgs

        return imgs
    }

    const getBackCards = () =>{
        return backCard.value
    }

    const buyCardTheme = async (theme) => {
        const user = auth.currentUser
        if (!user) throw new Error("User not logged in")

        if (user.coins_balance < theme.price) {
            throw new Error("Saldo insuficiente")
        }

        await api.updateUserTheme(theme.img, theme.price)
        await auth.getUser()
    }

    const setCardTheme = async (themeName) => {
        await api.changeCardTheme(themeName)
        await auth.getUser()
    }

    return {
        backCard,
        loadImagesBack,
        getBackCards,
        buyCardTheme,
        setCardTheme
    }
})
