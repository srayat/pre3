import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth } from 'boot/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)

  onAuthStateChanged(auth, (userData) => {
    user.value = userData
    isAuthenticated.value = !!userData
  })

  return {
    user,
    isAuthenticated
  }
})