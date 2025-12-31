<template>
    <Card class="mb-6">
        <CardHeader class="text-center">
            <CardTitle class="text-lg font-semibold">Order</CardTitle>
        </CardHeader>

        <CardContent class="text-center space-y-2">
            <div class="text-lg font-semibold">Coins Package</div>
            <div class="text-yellow-600 font-bold text-xl">
            {{ coins }} Coins
            </div>
            <div class="text-gray-600">
            Total: <span class="font-semibold">{{ value }} €</span>
            </div>
        </CardContent>
        </Card>

    <div class="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">

        <h2 class="text-xl font-bold mb-4 text-center">Buy Coins</h2>

        <!-- Payment Type -->
        <label class="block mb-2 font-medium">Payment Method</label>
        <select v-model="paymentType" class="w-full border rounded p-2 mb-4">
            <option value="MBWAY">MB Way</option>
            <option value="PAYPAL">PayPal</option>
            <option value="IBAN">IBAN</option>
            <option value="MB">Multibanco</option>
            <option value="VISA">Visa</option>
        </select>

        <!-- Reference -->
        <label class="block mb-2 font-medium">Reference</label>
        <input
            v-model="reference"
            class="w-full border rounded p-2 mb-4"
            placeholder="Enter reference"
        />

        <!-- Value -->
        <label class="block mb-2 font-medium">Value (€)</label>
        <input
            v-model.number="value"
            type="number"
            min="1"
            max="99"
            class="w-full border rounded p-2 mb-4"
        />

        <div class="text-center text-yellow-600 font-semibold mb-4">
            You will receive {{ coins }} coins
        </div>

        <p v-if="errorMessage" class="text-red-600 mb-3 text-center">
            {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="text-green-600 mb-3 text-center">
            {{ successMessage }}
        </p>

        <button
            class="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            :disabled="loading"
            @click="submitPayment"
        >
            {{ loading ? 'Processing...' : 'Pay' }}
        </button>

    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAPIStore } from '@/stores/api'

const route = useRoute()
const authStore = useAuthStore()
const apiStore = useAPIStore()

const paymentType = ref<'MBWAY' | 'PAYPAL' | 'IBAN' | 'MB' | 'VISA'>('MBWAY')
const reference = ref('')
//const value = ref(1)

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const value = Number(route.query.value)
const coins = Number(route.query.coins)

if (!value || !coins) {
  // segurança: acesso direto inválido
}

//const coins = computed(() => value.value * 10)

const validators = {
    MBWAY: /^9\d{8}$/,
    PAYPAL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    IBAN: /^[A-Z]{2}\d{23}$/,
    MB: /^\d{5}-\d{9}$/,
    VISA: /^4\d{15}$/
}

function validateForm() {
    errorMessage.value = ''

    if (!validators[paymentType.value].test(reference.value)) {
        errorMessage.value = 'Invalid reference format'
        return false
    }

    return true
}

async function submitPayment() {
    if (!validateForm()) return

    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const response = await axios.post(
        'https://dad-payments-api.vercel.app/api/debit',
        {
            type: paymentType.value,
            reference: reference.value,
            value: value,
        }
        )

        if (response.status === 201) {
            await apiStore.purchaseCoins(value, coins)

            await authStore.getUser()
            successMessage.value = `Payment successful! ${coins} coins added.`
        }

    } catch (error: any) {
        if (error.response?.status === 422) {
            errorMessage.value = 'Payment rejected: invalid data or insufficient funds'
        } else {
            errorMessage.value = 'Unexpected error. Try again later.'
        }
    } finally {
        loading.value = false
    }
}

</script>