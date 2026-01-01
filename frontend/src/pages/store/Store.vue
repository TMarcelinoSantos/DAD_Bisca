<template>
    <div class="min-h-screen bg-[radial-gradient(circle_at_top,#14532d,#052e16)]">
      <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-3xl font-bold mb-8">Store</h1>

          <Card class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <CardHeader class= "flex flex-col items-center gap-2 text-center">
              <CardTitle>Coins</CardTitle>
              <CardDescription>Choose a package</CardDescription>
            </CardHeader>

            <CardContent>
              <div class="w-10/12 mx-auto">
                <Carousel class="w-full max-w-xxs">
                  <CarouselContent>
                    <CarouselItem
                      v-for="pack in coinPackages"
                      :key="pack.id"
                      class="basis-1/2 sm:basis-1/2 md:basis-1/3"
                    >
                      <div class="px-6 py-4 flex flex-col items-center">
                        <Card class="rounded-xl overflow-hidden w-28 h-28 flex items-center justify-center cursor-pointer shadow-lg
                            bg-gradient-to-br from-yellow-200 to-yellow-400"
                          @click="goToPayment(pack.price, pack.coins)"
                        >
                          <Coins class="w-12 h-12 text-yellow-800" />     
                        </Card>

                        <div class="mt-3 text-center">
                          <div class="text-sm font-medium text-gray-800">
                            {{ pack.name }}
                          </div>
                          <div class="mt-1 text-green-700 font-semibold">
                            {{ pack.price }}€
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
                
              <div class="mt-6 flex flex-col items-center gap-4">
                <p class="text-lg font-semibold">Buy Coins</p>

                <div class="flex items-center gap-4">
                  <button class="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-xl font-bold"
                    @click="decrementEuros"> - </button>

                  <div class="text-xl font-bold w-20 text-center"> {{ euros }} € </div>

                  <button class="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-xl font-bold"
                    @click="incrementEuros"> + </button>
                </div>

                <div class="text-yellow-700 font-semibold">
                  You will receive <span class="font-bold">{{ coinsFromEuros }}</span> coins
                </div>

                <button class="mt-2 px-6 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600
                    text-white font-semibold shadow-lg"
                  @click="goToPayment(euros, coinsFromEuros)">
                  Buy Coins
                </button>
              </div>
            </CardContent>
          </Card>

          <br></br>

          <Card class="bg-[linear-gradient(145deg,#fdf5e6,#e7dcc3)] border-2 border-yellow-700 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <CardHeader class="flex flex-col items-center gap-2 text-center">
              <CardTitle>Card Theme Options</CardTitle>
            </CardHeader>
            <CardContent>
              <!--Card Theme options-->
              <div class="w-10/12 mx-auto mt-8">
                <Carousel class="w-full max-w-xxs">
                  <CarouselContent>
                    <CarouselItem
                      v-for="option in cardBacks"
                      :key="option.id"
                      class="basis-1/2 sm:basis-1/2 md:basis-1/3"
                    >
                      <!-- use px so items aren't flush to the carousel edges -->
                      <div class="px-6 py-2 flex flex-col items-center">
                        <Card class="rounded-lg overflow-hidden w-28 h-40 flex items-center justify-center cursor-pointer shadow-lg z-10"
                          @click="confirmPurchase({ id: option.id, name: option.name, price: option.price, img: option.src}, 'card' )"
                        >
                          <!-- card back image sized as a deck card -->
                          <img :src="option.src" :alt="option.name" class="w-full h-full object-contain" />
                        </Card>

                        <div class="mt-3 text-center">
                          <div class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ option.name }}</div>
                          <div class="mt-1 text-yellow-500 font-semibold">{{ option.price }} <span class="text-gray-600 text-xs">coins</span></div>
                        </div>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>

    <!-- Confirmation popup -->
    <transition name="fade">
      <div v-if="showConfirm" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click.self="cancelPurchase"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg w-11/12 max-w-sm p-6 z-10">
          <div class="flex flex-col items-center">
            <img :src="selected?.img" alt="" class="w-24 h-24 rounded-full object-cover mb-4" />
            <div class="text-lg font-semibold text-gray-800 dark:text-gray-100">{{ selected?.name }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-300 mb-3">Do you really want to buy this item?</div>
            <div class="text-yellow-500 font-semibold mb-4">{{ selected?.price }} <span class="text-gray-600 text-xs">coins</span></div>

            <div class="flex gap-3 w-full">
              <button class="flex-1 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" @click="buyConfirmed">
                Confirm
              </button>
              <button class="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700" @click="cancelPurchase">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!-- Error popup -->
    <transition name="fade">
      <div v-if="showError" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click.self="showError = false"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg w-11/12 max-w-sm p-6 z-10">
          <div class="flex flex-col items-center">
            <div class="text-lg font-semibold text-red-600 mb-3">{{ errorMessage }}</div>
            <button class="py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700" @click="showError = false">
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="showPayment" class="fixed inset-0 z-50 flex items-center justify-center">
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
              v-model.number="euros"
              type="number"
              min="1"
              max="99"
              class="w-full border rounded p-2 mb-4"
          />

          <div class="text-center text-yellow-600 font-semibold mb-4">
              You will receive {{ coinsFromEuros }} coins
          </div>

          <p v-if="errorMessage" class="text-red-600 mb-3 text-center">
              {{ errorMessage }}
          </p>

          <p v-if="successMessage" class="text-green-600 mb-3 text-center">
              {{ successMessage }}
          </p>

          <div class="flex gap-3 w-full">
            <button
                class="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                :disabled="loading"
                @click="submitPayment"
            >
                {{ loading ? 'Processing...' : 'Pay' }}
            </button>

            <button class="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700" @click="cancelPayment">
              Cancel
            </button>
          </div>
      </div>
    </div>
    </transition>

</template>


<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Coins } from 'lucide-vue-next'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { ref, computed } from 'vue'
import { useCostumizationsStore } from '@/stores/customizations'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAPIStore } from '@/stores/api'
import axios from 'axios'

const apiStore = useAPIStore()
const authStore = useAuthStore()
const router = useRouter();
const customizationsStore = useCostumizationsStore()

const showConfirm = ref(false)
const selected = ref<any>(null)
const cardBacks = ref<any>(null)
const showError = ref(false)
const errorMessage = ref('')


const showPayment = ref(false)
const paymentType = ref<'MBWAY' | 'PAYPAL' | 'IBAN' | 'MB' | 'VISA'>('MBWAY')
const reference = ref('')

const loading = ref(false)
const successMessage = ref('')

const coinPackages = ref([
  {
    id: 'coins_10',
    name: '10 Coins',
    coins: 10,
    price: 1,
  },
  {
    id: 'coins_50',
    name: '50 Coins',
    coins: 50,
    price: 5,
  },
  {
    id: 'coins_100',
    name: '100 Coins',
    coins: 100,
    price: 10,
  },
  {
    id: 'coins_150',
    name: '150 Coins',
    coins: 150,
    price: 15,
  },
])

const euros = ref(1)

const coinsFromEuros = computed(() => {
  return euros.value * 10
})

function incrementEuros() {
  euros.value++
}

function decrementEuros() {
  if (euros.value > 1) {
    euros.value--
  }
}

function goToPayment(euros: number, coins: number) {
  selected.value = { euros, coins };
  showPayment.value = true;
}

function cancelPayment() {
  selected.value = null
  showPayment.value = false
}



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
            value: euros.value,
        }
        )

        if (response.status === 201) {
            await apiStore.purchaseCoins({
                euros: euros.value,
                coins: coinsFromEuros.value,
                payment_type: paymentType.value,
                payment_reference: reference.value,
            })

            await authStore.getUser()
            successMessage.value = `Payment successful! ${coinsFromEuros.value} coins added.`
            cancelPayment()
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

function confirmPurchase(item: { id: number; name: string; price: number; img: string }, type: 'coins' | 'card') {
  selected.value = { ...item, type };
  showConfirm.value = true;
}

function cancelPurchase() {
  selected.value = null
  showConfirm.value = false
}

const buyConfirmed = async () => {
  console.log('Purchase confirmed for', selected.value)
  const item = selected.value
  
  if (authStore.currentUser.coins_balance < item.price) {
    errorMessage.value = "Not enough Coins!!"
    showError.value = true
    showConfirm.value = false
    return
}

  try{
    if (item.type === 'card') {
      const themeName = item.id.endsWith('.png') ? item.id : `${item.id}.png`;
      await customizationsStore.buyCardTheme({img: themeName, price: item.price}) 
    }

    await authStore.getUser()

    showConfirm.value = false
    selected.value = null
    router.push({ name: 'customizations' })
  }catch (error) {
    console.error("Erro ao comprar carta:", error)
    alert("Erro ao comprar a carta. Tenta novamente.")
  }
}

  onMounted(async () => {
    const imgs = customizationsStore.loadImagesBack() || []
    cardBacks.value = imgs.map((i, idx) => ({
      id: i.id,
      filename: i.id + '.png',
      name: i.id.replace(/[-_]/g, ' '),
      price: 1 + (idx * 1),
      src: i.src
    }))
  })

</script>

