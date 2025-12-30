<template>
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

        <!-- Coins -->
        <div class="text-center text-yellow-600 font-semibold mb-4">
            You will receive {{ coins }} coins
        </div>

        <!-- Errors -->
        <p v-if="errorMessage" class="text-red-600 mb-3 text-center">
            {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="text-green-600 mb-3 text-center">
            {{ successMessage }}
        </p>

        <!-- Submit -->
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
import { useRoute } from 'vue-router'

const route = useRoute()

const paymentType = ref<'MBWAY' | 'PAYPAL' | 'IBAN' | 'MB' | 'VISA'>('MBWAY')
const reference = ref('')
const value = ref(1)

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')


const coins = computed(() => value.value * 10)

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

  if (!Number.isInteger(value.value) || value.value < 1 || value.value > 99) {
    errorMessage.value = 'Value must be an integer between 1 and 99'
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
        value: value.value,
      }
    )

    if (response.status === 201) {
      successMessage.value = `Payment successful! ${coins.value} coins added.`
      // aqui chamarias o backend para adicionar coins ao user
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