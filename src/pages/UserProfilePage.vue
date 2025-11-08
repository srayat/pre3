<template>
  <q-page class="flex flex-center q-pa-md bg-grey-1">
    <div class="row justify-between items-center q-mx-auto full-width q-mt-lg q-mb-xl">
      <div>
        <q-btn flat color="primary" icon="arrow_back" label="" class="" to="/more" />
      </div>
      <div class="text-h6">Your Profile</div>
      <div class="q-px-lg"></div>
    </div>
    <UserProfileCard />
  </q-page>
</template>

<script setup>
import UserProfileCard from 'components/UserProfileCard.vue'
</script>
