<template>
  <q-page class="home-page flex flex-center column">
    <div class="text-h3 text-weight-bold text-primary q-mb-md">Fun stuff coming here soon</div>
    <div class="text-body1 text-grey-7">
      We are building something special. Check back shortly!
    </div>
  </q-page>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from 'boot/firebase'

const router = useRouter()
let unsubscribe = () => {}

onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.replace('/sign-in')
    }
  })
})

onBeforeUnmount(() => {
  unsubscribe()
})
</script>

<style scoped>
.home-page {
  min-height: 100%;
  background: linear-gradient(180deg, #f9fbff 0%, #eef3ff 100%);
  text-align: center;
  padding: 64px 16px 96px;
}
</style>
