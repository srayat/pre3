<template>
  <q-page class="event-manage-page column q-pa-lg">
    <div class="page-width row items-center q-col-gutter-sm justify-between">
      <q-btn flat round icon="arrow_back" color="primary" @click="goBack" />
      <div class="text-h5 text-weight-bold text-primary q-ml-sm">
        Manage Event
      </div>
    </div>

    <q-card flat bordered class="event-card page-width">
      <q-inner-loading :showing="eventLoading">
        <q-spinner color="primary" size="32px" />
      </q-inner-loading>

      <div v-if="eventData" class="column q-gutter-sm">
        <div class="text-h6 text-weight-bold text-primary">
          {{ eventData.name }}
        </div>
        <div class="text-body2 text-grey-7">
          {{ eventData.description || 'No description provided.' }}
        </div>

        <div class="row text-body2 text-grey-8 q-gutter-sm">
          <span v-if="formattedDate">
            <q-icon name="event" size="16px" class="q-mr-xs" />
            {{ formattedDate }}
          </span>
          <span v-if="eventData.location">
            <q-icon name="place" size="16px" class="q-mr-xs" />
            {{ eventData.location }}
          </span>
          <span>
            <q-icon name="people" size="16px" class="q-mr-xs" />
            Capacity: {{ eventData.capacity || 'N/A' }}
          </span>
        </div>

        <div class="row items-center q-gutter-sm">
          <q-badge color="primary" align="middle" rounded>
            {{ eventData.status || 'draft' }}
          </q-badge>
          <div class="text-caption text-grey-6">
            Last updated: {{ formattedUpdatedAt }}
          </div>
        </div>
      </div>

      <div v-else-if="!eventLoading" class="text-negative">
        Event not found or you no longer have access.
      </div>
    </q-card>

    <q-card ref="stepsCardRef" flat bordered class="steps-card page-width">
      <div class="column q-gutter-sm">
        <q-banner v-if="recentlyCreated" class="bg-primary text-white q-pa-sm rounded-borders">
          <div class="text-subtitle1 text-weight-bold">Nice work! Step 1 is complete.</div>
          <div class="text-body2">
            Next, invite founders and judges so they can start collaborating on this event.
          </div>
        </q-banner>

        <div class="text-subtitle1 text-primary text-weight-bold">Next Steps</div>
        <div class="text-body2 text-grey-7">
          Choose what you would like to do next. You can come back here anytime to manage your
          invitations.
        </div>

        <div class="column q-gutter-sm q-mt-sm">
          <q-btn
            color="primary"
            outline
            label="Invite Startup Founders"
            icon="rocket_launch"
            no-caps
            class="q-py-sm"
            :disable="eventLoading"
            @click="openSection('founder')"
          />
          <q-btn
            color="primary"
            outline
            label="Invite Judges"
            icon="military_tech"
            no-caps
            class="q-py-sm"
            :disable="eventLoading"
            @click="openSection('judge')"
          />
        </div>
      </div>
    </q-card>

    <transition name="fade">
      <q-card
        v-if="activeSection === 'founder'"
        ref="founderCardRef"
        flat
        bordered
        class="invite-card page-width"
      >
        <div class="column q-gutter-sm">
          <div class="row items-center q-gutter-sm">
            <q-btn flat round icon="arrow_back" color="primary" @click="openSection(null)" />
            <div class="text-subtitle1 text-primary text-weight-bold">
              Invite Startup Founders
            </div>
          </div>
          <div class="text-body2 text-grey-7">
            Send a sign-in link to founders so they can claim their startup profile.
          </div>
        </div>

        <div class="text-subtitle2 text-grey-7 text-weight-medium q-mb-sm">
          Startups Added
        </div>

        <div v-if="founderInvites.length === 0" class="empty-state">
          <q-icon name="rocket_launch" color="primary" size="38px" class="q-mb-sm" />
          <div class="text-body2 text-grey-7 text-center">
            You have not added any startups yet. Enter the details below to get started.
          </div>
        </div>

        <q-list v-else bordered separator class="rounded-borders q-mb-md">
          <q-item v-for="invite in founderInvites" :key="invite.id">
            <q-item-section avatar>
              <q-icon name="rocket_launch" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ invite.startupName || invite.firstName || 'Untitled Startup' }}
              </q-item-label>
              <q-item-label caption>
                {{ invite.emailDisplay || invite.email }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                :color="invite.status === 'registered' ? 'positive' : 'grey-5'"
                class="text-weight-medium"
              >
                {{ invite.status }}
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>

        <div class="text-subtitle2 text-grey-7 text-weight-medium">Add Startup</div>

        <q-form
          ref="founderFormRef"
          class="column q-gutter-sm q-mt-sm form-section"
          @submit.prevent="submitInvite('founder')"
        >
          <q-input
            v-model="inviteForms.founder.startupName"
            label="Startup Name"
            dense
            outlined
            :disable="inviteLoading.founder"
            :rules="[requiredRule]"
          />
          <q-input
            v-model="inviteForms.founder.startupDescription"
            label="Startup Description (optional)"
            type="textarea"
            autogrow
            outlined
            :disable="inviteLoading.founder"
          />
          <q-input
            v-model="inviteForms.founder.email"
            label="Founder Email"
            dense
            outlined
            type="email"
            :disable="inviteLoading.founder"
            :rules="[emailRule]"
          />

          <q-btn
            type="submit"
            color="primary"
            label="Save Startup"
            no-caps
            class="q-py-sm"
            unelevated
            :loading="inviteLoading.founder"
          />
        </q-form>

        <div v-if="founderInvites.length > 0" class="next-action q-mt-md">
          <q-btn
            color="primary"
            outline
            no-caps
            class="q-py-sm full-width"
            icon="military_tech"
            label="Invite Judges Next"
            @click="openSection('judge')"
          />
        </div>
      </q-card>
    </transition>

    <transition name="fade">
      <q-card
        v-if="activeSection === 'judge'"
        ref="judgeCardRef"
        flat
        bordered
        class="invite-card page-width"
      >
        <div class="column q-gutter-sm">
          <div class="row items-center q-gutter-sm">
            <q-btn flat round icon="arrow_back" color="primary" @click="openSection(null)" />
            <div class="text-subtitle1 text-primary text-weight-bold">Invite Judges</div>
          </div>
          <div class="text-body2 text-grey-7">
            Invite judges to review pitches and share feedback.
          </div>
        </div>
        <div>
          <div class="text-subtitle1 text-primary text-weight-bold">
            Invite Startup Founders
          </div>
          <div class="text-body2 text-grey-7">
            Send a sign-in link to founders so they can claim their startup profile.
          </div>
        </div>

        <div class="text-subtitle2 text-grey-7 text-weight-medium q-mb-sm">
          Startups Added
        </div>

        <div v-if="founderInvites.length === 0" class="empty-state">
          <q-icon name="rocket_launch" color="primary" size="38px" class="q-mb-sm" />
          <div class="text-body2 text-grey-7 text-center">
            You have not added any startups yet. Enter the details below to get started.
          </div>
        </div>

        <q-list v-else bordered separator class="rounded-borders q-mb-md">
          <q-item v-for="invite in founderInvites" :key="invite.id">
            <q-item-section avatar>
              <q-icon name="rocket_launch" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ invite.startupName || invite.firstName || 'Untitled Startup' }}
              </q-item-label>
              <q-item-label caption>
                {{ invite.emailDisplay || invite.email }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                :color="invite.status === 'registered' ? 'positive' : 'grey-5'"
                class="text-weight-medium"
              >
                {{ invite.status }}
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>

        <div class="text-subtitle2 text-grey-7 text-weight-medium">Add Startup</div>

        <q-form
          ref="founderFormRef"
          class="column q-gutter-sm q-mt-sm form-section"
          @submit.prevent="submitInvite('founder')"
        >
          <q-input
            v-model="inviteForms.founder.startupName"
            label="Startup Name"
            dense
            outlined
            :disable="inviteLoading.founder"
            :rules="[requiredRule]"
          />
          <q-input
            v-model="inviteForms.founder.startupDescription"
            label="Startup Description (optional)"
            type="textarea"
            autogrow
            outlined
            :disable="inviteLoading.founder"
          />
          <q-input
            v-model="inviteForms.founder.email"
            label="Founder Email"
            dense
            outlined
            type="email"
            :disable="inviteLoading.founder"
            :rules="[emailRule]"
          />

          <q-btn
            type="submit"
            color="primary"
            label="Save Startup"
            no-caps
            class="q-py-sm"
            unelevated
            :loading="inviteLoading.founder"
          />
        </q-form>

        <div v-if="founderInvites.length > 0" class="next-action q-mt-md">
          <q-btn
            color="primary"
            outline
            no-caps
            class="q-py-sm full-width"
            icon="military_tech"
            label="Invite Judges Next"
            @click="openSection('judge')"
          />
        </div>
      </q-card>
    </transition>

    <transition name="fade">
      <q-card
        v-if="activeSection === 'judge'"
        ref="judgeCardRef"
        flat
        bordered
        class="invite-card page-width"
      >
        <div class="column q-gutter-sm">
          <div class="text-subtitle1 text-primary text-weight-bold">
            Invite Judges
          </div>
          <div class="text-body2 text-grey-7">
            Invite judges to review pitches and share feedback.
          </div>
        </div>

        <div class="text-subtitle2 text-grey-7 text-weight-medium q-mb-sm">
          Judges Added
        </div>

        <div v-if="judgeInvites.length === 0" class="empty-state">
          <q-icon name="gavel" color="primary" size="38px" class="q-mb-sm" />
          <div class="text-body2 text-grey-7 text-center">
            No judges invited yet. Add the experts who will review your event.
          </div>
        </div>

        <q-list v-else bordered separator class="rounded-borders q-mb-md">
          <q-item v-for="invite in judgeInvites" :key="invite.id">
            <q-item-section avatar>
              <q-icon name="military_tech" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ invite.firstName }} {{ invite.lastName }}
              </q-item-label>
              <q-item-label caption>{{ invite.emailDisplay || invite.email }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                :color="invite.status === 'registered' ? 'positive' : 'grey-5'"
                class="text-weight-medium"
              >
                {{ invite.status }}
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>

        <div class="text-subtitle2 text-grey-7 text-weight-medium">Add Judge</div>

        <q-form
          ref="judgeFormRef"
          class="column q-gutter-sm q-mt-sm form-section"
          @submit.prevent="submitInvite('judge')"
        >
          <div class="row q-col-gutter-sm full-width wrap">
            <q-input
              v-model="inviteForms.judge.firstName"
              label="First Name"
              dense
              outlined
              class="col-12 col-sm-6"
              :disable="inviteLoading.judge"
              :rules="[requiredRule]"
            />
            <q-input
              v-model="inviteForms.judge.lastName"
              label="Last Name"
              dense
              outlined
              class="col-12 col-sm-6"
              :disable="inviteLoading.judge"
              :rules="[requiredRule]"
            />
          </div>
          <q-input
            v-model="inviteForms.judge.email"
            label="Email"
            dense
            outlined
            type="email"
            :disable="inviteLoading.judge"
            :rules="[emailRule]"
          />

          <q-btn
            type="submit"
            color="primary"
            label="Send Invite"
            no-caps
            class="q-py-sm"
            unelevated
            :loading="inviteLoading.judge"
          />
        </q-form>
      </q-card>
    </transition>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from 'boot/firebase'
import { reservePerson } from 'src/utils/useInvitePerson'
import { isValidEmail, normalizeEmail } from 'src/utils/normalizeEmail'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const eventId = route.params.eventId
const eventData = ref(null)
const eventLoading = ref(true)
const founderInvites = ref([])
const judgeInvites = ref([])
const founderCardRef = ref(null)
const judgeCardRef = ref(null)
const stepsCardRef = ref(null)
const founderFormRef = ref(null)
const judgeFormRef = ref(null)

const inviteForms = reactive({
  founder: { startupName: '', startupDescription: '', email: '' },
  judge: { firstName: '', lastName: '', email: '' },
})

const inviteLoading = reactive({
  founder: false,
  judge: false,
})

const inviteFormRefs = {
  founder: founderFormRef,
  judge: judgeFormRef,
}

const activeSection = ref(null)

const requiredRule = (val) => (!!val && val.trim().length > 0) || 'This field is required'
const emailRule = (val) => (!val || isValidEmail(val)) || 'Enter a valid email address'

const formattedDate = computed(() => {
  if (!eventData.value?.date) return null
  const [year, month, day] = eventData.value.date.split('-').map(Number)
  if (!year || !month || !day) return eventData.value.date
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
})

const formattedUpdatedAt = computed(() => {
  if (!eventData.value?.updatedAt) return 'N/A'
  const ts = eventData.value.updatedAt.toDate?.() ?? eventData.value.updatedAt
  return new Date(ts).toLocaleString()
})

const recentlyCreated = ref(route.query.created === '1')

let unsubAuth = () => {}
let unsubEvent = () => {}
let unsubFounders = () => {}
let unsubJudges = () => {}
let listenersAttached = false
let inviteListenersAttached = false

function cleanup() {
  unsubEvent()
  unsubFounders()
  unsubJudges()
  listenersAttached = false
  inviteListenersAttached = false
}

onMounted(() => {
  unsubAuth = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      cleanup()
      await router.replace('/sign-in')
      return
    }

    if (!listenersAttached) {
      listenersAttached = true
      attachEventListener(user.uid)
    }
  })
})

onBeforeUnmount(() => {
  unsubAuth()
  cleanup()
})

function attachEventListener(currentUid) {
  const eventRef = doc(db, 'events', eventId)
  unsubEvent = onSnapshot(
    eventRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        eventLoading.value = false
        eventData.value = null
        $q.notify({
          type: 'negative',
          message: 'Event not found.',
        })
        router.replace('/home')
        return
      }

      const data = snapshot.data()

      if (data.hostUid !== currentUid) {
        eventLoading.value = false
        $q.notify({
          type: 'negative',
          message: 'You no longer have access to this event.',
        })
        router.replace('/home')
        return
      }

      eventData.value = {
        id: snapshot.id,
        ...data,
      }

      eventLoading.value = false

      if (route.query.created === '1') {
        openSection('founder')
        clearCreatedQuery()
      } else if (!activeSection.value && founderInvites.value.length > 0) {
        activeSection.value = 'founder'
      }

      if (!inviteListenersAttached) {
        inviteListenersAttached = true
        attachInviteListeners()
      }
    },
    (error) => {
      console.error(error)
      eventLoading.value = false
      $q.notify({
        type: 'negative',
        message: 'Unable to load this event.',
      })
      router.replace('/home')
    }
  )
}

function attachInviteListeners() {
  const startupsRef = collection(db, `events/${eventId}/startups`)
  const judgesRef = collection(db, `events/${eventId}/judges`)

  unsubFounders = onSnapshot(
    query(startupsRef, orderBy('createdAt', 'desc')),
    (snapshot) => {
      founderInvites.value = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      if (!activeSection.value && founderInvites.value.length > 0) {
        activeSection.value = 'founder'
      }
    },
    (error) => {
      console.error(error)
      $q.notify({
        type: 'warning',
        message: 'Unable to load founder invitations.',
      })
    }
  )

  unsubJudges = onSnapshot(
    query(judgesRef, orderBy('createdAt', 'desc')),
    (snapshot) => {
      judgeInvites.value = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      if (!activeSection.value && founderInvites.value.length === 0 && judgeInvites.value.length > 0) {
        activeSection.value = 'judge'
      }
    },
    (error) => {
      console.error(error)
      $q.notify({
        type: 'warning',
        message: 'Unable to load judge invitations.',
      })
    }
  )
}

function goBack() {
  router.back()
}

function clearCreatedQuery() {
  recentlyCreated.value = true
  const newQuery = { ...route.query }
  delete newQuery.created
  router.replace({ path: route.path, params: { ...route.params }, query: newQuery })
}

function openSection(section) {
  activeSection.value = section
  nextTick(() => {
    if (section) {
      scrollToSection(section)
    } else {
      const target = stepsCardRef.value?.$el || stepsCardRef.value
      target?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    }
  })
}

function scrollToSection(section) {
  if (!section) {
    return
  }
  const target =
    section === 'founder'
      ? founderCardRef.value?.$el || founderCardRef.value
      : judgeCardRef.value?.$el || judgeCardRef.value

  if (target?.scrollIntoView) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

async function submitInvite(role) {
  if (!eventData.value) {
    $q.notify({ type: 'warning', message: 'Event is still loading. Please wait.' })
    return
  }

  if (!auth.currentUser) {
    await router.replace('/sign-in')
    return
  }

  const form = inviteForms[role]

  if (role === 'founder') {
    if (!form.startupName.trim() || !isValidEmail(form.email)) {
      $q.notify({
        type: 'warning',
        message: 'Please provide a startup name and founder email.',
      })
      return
    }
  } else {
    if (!form.firstName.trim() || !form.lastName.trim() || !isValidEmail(form.email)) {
      $q.notify({ type: 'warning', message: 'Please complete the invitation form.' })
      return
    }
  }

  inviteLoading[role] = true

  try {
    const trimmedEmail = form.email.trim()
    let trimmedFirst = ''
    let trimmedLast = ''
    let trimmedStartupName = ''
    let trimmedStartupDescription = ''

    if (role === 'founder') {
      trimmedStartupName = form.startupName.trim()
      trimmedStartupDescription = form.startupDescription?.trim() || ''
    } else {
      trimmedFirst = form.firstName.trim()
      trimmedLast = form.lastName.trim()
    }

    const { personId, status, linkedUid } = await reservePerson(trimmedEmail, trimmedFirst, trimmedLast)

    const collectionName = role === 'founder' ? 'startups' : 'judges'
    const inviteRef = doc(db, `events/${eventId}/${collectionName}/${personId}`)
    const existingInvite = await getDoc(inviteRef)
    const existingData = existingInvite.exists() ? existingInvite.data() : {}
    const timestamp = serverTimestamp()

    const payload = {
      personId,
      email: normalizeEmail(trimmedEmail),
      emailDisplay: trimmedEmail,
      status,
      linkedUid: linkedUid || existingData.linkedUid || null,
      claimedByUid: linkedUid || existingData.claimedByUid || null,
      updatedAt: timestamp,
    }

    if (role === 'founder') {
      payload.startupName = trimmedStartupName
      payload.startupDescription = trimmedStartupDescription || existingData.startupDescription || null
    } else {
      payload.firstName = trimmedFirst
      payload.lastName = trimmedLast
    }

    if (!existingInvite.exists()) {
      payload.createdAt = timestamp
      payload.invitedByUid = auth.currentUser.uid
    }

    await setDoc(inviteRef, payload, { merge: true })

    if (role === 'founder') {
      inviteForms.founder.startupName = ''
      inviteForms.founder.startupDescription = ''
      inviteForms.founder.email = ''
    } else {
      inviteForms.judge.firstName = ''
      inviteForms.judge.lastName = ''
      inviteForms.judge.email = ''
    }

    await nextTick()
    if (inviteFormRefs[role]?.value?.resetValidation) {
      inviteFormRefs[role].value.resetValidation()
    }

    const successMessage =
      role === 'founder'
        ? `Added ${trimmedStartupName} to your event.`
        : `Invitation sent to ${trimmedFirst} ${trimmedLast}.`

    $q.notify({
      type: 'positive',
      message: successMessage,
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Unable to send the invitation. Please try again.',
    })
  } finally {
    inviteLoading[role] = false
  }
}
</script>

<style scoped>
.event-manage-page {
  min-height: 100%;
  background: linear-gradient(180deg, #eef3ff 0%, #ffffff 95%);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
  gap: 16px;
}

.event-card,
.invite-card {
  border-radius: 18px;
  box-shadow: 0 18px 42px rgba(15, 35, 95, 0.1);
  padding: 20px;
}

.invite-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  border-radius: 16px;
  background: rgba(48, 113, 198, 0.08);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.rounded-borders {
  border-radius: 16px;
  overflow: hidden;
}

.text-subtitle2 {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.page-width {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.event-card,
.steps-card,
.invite-card {
  width: 100%;
  margin: 0 auto;
}

.page-width.row {
  width: 100%;
}

.form-section .q-input,
.form-section .q-btn,
.form-section .q-list,
.form-section .empty-state {
  width: 100%;
}

.form-section .row {
  width: 100%;
}


.next-action {
  display: flex;
  justify-content: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
