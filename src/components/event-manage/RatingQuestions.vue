<template>
  <div class="rating-questions-container">
    <q-card flat class="q-pa-md">
      <!-- Header with Enable/Disable Toggle -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Rating Questions</div>
        <q-toggle
          v-model="questionsEnabled"
          label="Enable Rating Questions"
          color="primary"
          @update:model-value="handleEnableToggle"
        />
      </div>

      <template v-if="questionsEnabled">
        <!-- Question Set Toggle -->
        <q-card flat bordered class="q-mb-md q-pa-md bg-grey-1">
          <q-option-group
            v-model="questionSetType"
            :options="questionSetOptions"
            color="primary"
            @update:model-value="handleQuestionSetChange"
          />
        </q-card>

        <!-- Audience Questions -->
        <div v-if="questionSetType === 'same' || questionSetType === 'different'" class="q-mb-lg">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-medium">
              {{ questionSetType === 'same' ? 'Rating Questions (Audience & Judges)' : 'Audience Rating Questions' }}
            </div>
            <q-btn
              flat
              dense
              color="primary"
              icon="add"
              label="Add Question"
              @click="addQuestion('audience')"
            />
          </div>

          <div class="text-caption text-grey-7 q-mb-sm">
            All questions use a 1-10 rating scale. Drag to reorder.
          </div>

          <div class="questions-list">
            <div
              v-for="(element, index) in audienceQuestions"
              :key="element.id"
              class="question-card"
              draggable="true"
              @dragstart="handleDragStart($event, index, 'audience')"
              @dragover.prevent="handleDragOver($event, index, 'audience')"
              @drop="handleDrop($event, index, 'audience')"
              @dragend="handleDragEnd"
            >
              <q-input
                v-model="element.question"
                outlined
                dense
                label="Question"
                placeholder="e.g., How innovative is the startup idea?"
                class="full-width"
                :rules="[val => !!val || 'Question is required']"
                @blur="saveQuestion('audience', element)"
              />
              <div class="row items-center justify-between q-mt-sm">
                <div class="text-caption text-grey-6">
                  Rating: 1-10 scale
                </div>
                <div class="row q-gutter-xs items-center">
                  <q-icon name="menu" size="20px" class="drag-handle text-grey-6" />
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    color="negative"
                    icon="delete"
                    @click.stop="deleteQuestion('audience', index)"
                  >
                    <q-tooltip>Delete Question</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>

          <div v-if="audienceQuestions.length === 0" class="empty-state">
            <q-icon name="quiz" color="primary" size="38px" class="q-mb-sm" />
            <div class="text-body2 text-grey-7 text-center">
              No questions added yet. Click "Add Question" to get started.
            </div>
          </div>
        </div>

        <!-- Judge Questions (only if different) -->
        <div v-if="questionSetType === 'different'" class="q-mb-lg">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-medium">Judge Rating Questions</div>
            <q-btn
              flat
              dense
              color="primary"
              icon="add"
              label="Add Question"
              @click="addQuestion('judge')"
            />
          </div>

          <div class="text-caption text-grey-7 q-mb-sm">
            All questions use a 1-10 rating scale. Drag to reorder.
          </div>

          <div class="questions-list">
            <div
              v-for="(element, index) in judgeQuestions"
              :key="element.id"
              class="question-card"
              draggable="true"
              @dragstart="handleDragStart($event, index, 'judge')"
              @dragover.prevent="handleDragOver($event, index, 'judge')"
              @drop="handleDrop($event, index, 'judge')"
              @dragend="handleDragEnd"
            >
              <q-input
                v-model="element.question"
                outlined
                dense
                label="Question"
                placeholder="e.g., How innovative is the startup idea?"
                class="full-width"
                :rules="[val => !!val || 'Question is required']"
                @blur="saveQuestion('judge', element)"
              />
              <div class="row items-center justify-between q-mt-sm">
                <div class="text-caption text-grey-6">
                  Rating: 1-10 scale
                </div>
                <div class="row q-gutter-xs items-center">
                  <q-icon name="menu" size="20px" class="drag-handle text-grey-6" />
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    color="negative"
                    icon="delete"
                    @click.stop="deleteQuestion('judge', index)"
                  >
                    <q-tooltip>Delete Question</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>

          <div v-if="judgeQuestions.length === 0" class="empty-state">
            <q-icon name="quiz" color="primary" size="38px" class="q-mb-sm" />
            <div class="text-body2 text-grey-7 text-center">
              No questions added yet. Click "Add Question" to get started.
            </div>
          </div>
        </div>

        <!-- Feedback Section -->
        <div class="q-mb-lg">
          <q-card flat bordered class="q-pa-md bg-blue-1">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle1 text-weight-medium">Written Feedback</div>
              <q-toggle
                v-model="feedbackEnabled"
                label="Enable"
                color="primary"
              />
            </div>
            <div class="text-body2 text-grey-7 q-mb-sm">
              Allow participants to provide written comments and feedback for each startup.
            </div>
            <div class="text-caption text-grey-7">
              <q-icon name="info" size="16px" class="q-mr-xs" />
              Maximum 200 words per feedback comment
            </div>
          </q-card>
        </div>

        <!-- Action Buttons -->
        <div class="row justify-end q-gutter-sm q-mt-md">
          <q-btn flat label="Reset to Defaults" color="secondary" @click="resetToDefaults" />
        
          <q-btn 
  unelevated 
  label="Save Configuration" 
  color="primary" 
  :loading="saving"
  @click="saveAllQuestions" 
/>
        </div>
      </template>

      <div v-else class="text-center q-pa-lg text-grey">
        Rating questions are disabled for this event.
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from 'boot/firebase'

const props = defineProps({
  eventId: {
    type: String,
    required: true
  }
})

const $q = useQuasar()

// State
const questionsEnabled = ref(true)
const questionSetType = ref('same')
const audienceQuestions = ref([])
const judgeQuestions = ref([])
const feedbackEnabled = ref(true)
const saving = ref(false)

// Drag and drop state
const draggedIndex = ref(null)
const draggedType = ref(null)

console.log('RatingQuestions component loaded, eventId:', props.eventId)  // for debugging

// Options
const questionSetOptions = [
  { label: 'Same questions for Audience & Judges', value: 'same' },
  { label: 'Different questions for Audience & Judges', value: 'different' }
]

// Default questions (all 1-10 rating)
const defaultQuestions = [
  {
    id: generateId(),
    question: 'How innovative is the startup idea?',
    type: 'rating',
    maxRating: 10,
    order: 0
  },
  {
    id: generateId(),
    question: 'How viable is the business model?',
    type: 'rating',
    maxRating: 10,
    order: 1
  },
  {
    id: generateId(),
    question: 'How strong is the team?',
    type: 'rating',
    maxRating: 10,
    order: 2
  },
  {
    id: generateId(),
    question: 'How significant is the market opportunity?',
    type: 'rating',
    maxRating: 10,
    order: 3
  },
  {
    id: generateId(),
    question: 'How compelling was the pitch presentation?',
    type: 'rating',
    maxRating: 10,
    order: 4
  }
]

// Helper function to generate unique IDs
function generateId() {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Drag and Drop handlers
function handleDragStart(event, index, type) {
  draggedIndex.value = index
  draggedType.value = type
  event.currentTarget.classList.add('dragging')
}

function handleDragOver(event, index, type) {
  if (draggedType.value !== type) return
  
  const targetItem = event.currentTarget
  targetItem.classList.add('drag-over')
}

function handleDrop(event, dropIndex, type) {
  event.preventDefault()
  
  if (draggedType.value !== type || draggedIndex.value === null) return
  
  const questions = type === 'audience' ? audienceQuestions : judgeQuestions
  const dragIndex = draggedIndex.value
  
  if (dragIndex === dropIndex) return
  
  // Reorder array
  const item = questions.value[dragIndex]
  questions.value.splice(dragIndex, 1)
  questions.value.splice(dropIndex, 0, item)
  
  // Update order property
  questions.value.forEach((q, i) => q.order = i)
  
  // Clear drag state
  document.querySelectorAll('.drag-over').forEach(el => {
    el.classList.remove('drag-over')
  })
}

function handleDragEnd(event) {
  event.currentTarget.classList.remove('dragging')
  document.querySelectorAll('.drag-over').forEach(el => {
    el.classList.remove('drag-over')
  })
  draggedIndex.value = null
  draggedType.value = null
}


// Load questions from Firestore
async function loadQuestions() {
  console.log('loadQuestions called with eventId:', props.eventId)  // for debugging
  try {
    const eventRef = doc(db, 'events', props.eventId)
    const eventDoc = await getDoc(eventRef)

    if (eventDoc.exists()) {
      const data = eventDoc.data()
      
      questionsEnabled.value = data.ratingQuestionsEnabled ?? true
      questionSetType.value = data.questionSetType ?? 'same'
      feedbackEnabled.value = data.feedbackEnabled ?? true
      
      if (data.audienceQuestions && data.audienceQuestions.length > 0) {
        audienceQuestions.value = data.audienceQuestions
      } else {
        audienceQuestions.value = JSON.parse(JSON.stringify(defaultQuestions))
      }

      if (data.judgeQuestions && data.judgeQuestions.length > 0) {
        judgeQuestions.value = data.judgeQuestions
      } else if (questionSetType.value === 'different') {
        judgeQuestions.value = JSON.parse(JSON.stringify(defaultQuestions))
      }
    } else {
      audienceQuestions.value = JSON.parse(JSON.stringify(defaultQuestions))
    }
  } catch (error) {
    console.error('Error loading questions:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load questions'
    })
  }
}

// Add new question
function addQuestion(type) {
  const newQuestion = {
    id: generateId(),
    question: '',
    type: 'rating',
    maxRating: 10,
    order: type === 'audience' ? audienceQuestions.value.length : judgeQuestions.value.length
  }

  if (type === 'audience') {
    audienceQuestions.value.push(newQuestion)
  } else {
    judgeQuestions.value.push(newQuestion)
  }
}

// Delete question
function deleteQuestion(type, index) {
  if (type === 'audience') {
    audienceQuestions.value.splice(index, 1)
    audienceQuestions.value.forEach((q, i) => q.order = i)
  } else {
    judgeQuestions.value.splice(index, 1)
    judgeQuestions.value.forEach((q, i) => q.order = i)
  }
  
  $q.notify({
    type: 'positive',
    message: 'Question deleted'
  })
}

// Save individual question (auto-save on blur)
async function saveQuestion(type, question) {
  if (!question.question.trim()) return
  
  try {
    const eventRef = doc(db, 'events', props.eventId)
    const updateData = {}
    
    if (type === 'audience') {
      updateData.audienceQuestions = audienceQuestions.value
    } else {
      updateData.judgeQuestions = judgeQuestions.value
    }
    
    updateData.updatedAt = new Date()
    await updateDoc(eventRef, updateData)
    
    console.log(`Auto-saved ${type} question:`, question)
  } catch (error) {
    console.error('Error auto-saving question:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to auto-save question'
    })
  }
}

// Handle enable/disable toggle
async function handleEnableToggle(value) {
  try {
    const eventRef = doc(db, 'events', props.eventId)
    await updateDoc(eventRef, {
      ratingQuestionsEnabled: value,
      updatedAt: new Date()
    })
    console.log('Questions enabled:', value)
  } catch (error) {
    console.error('Error updating questions enabled:', error)
  }
}

// Handle question set type change
function handleQuestionSetChange(value) {
  if (value === 'different' && judgeQuestions.value.length === 0) {
    judgeQuestions.value = JSON.parse(JSON.stringify(defaultQuestions))
  }
}

// Reset to defaults
function resetToDefaults() {
  $q.dialog({
    title: 'Reset to Defaults',
    message: 'This will replace all questions with the default set. Are you sure?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    audienceQuestions.value = JSON.parse(JSON.stringify(defaultQuestions))
    if (questionSetType.value === 'different') {
      judgeQuestions.value = JSON.parse(JSON.stringify(defaultQuestions))
    }
    feedbackEnabled.value = true
    
    $q.notify({
      type: 'positive',
      message: 'Questions reset to defaults'
    })
  })
}

// Save all questions to Firestore
async function saveAllQuestions() {
    saving.value = true
  try {
    const hasEmptyQuestions = audienceQuestions.value.some(q => !q.question.trim()) ||
      (questionSetType.value === 'different' && judgeQuestions.value.some(q => !q.question.trim()))

    if (hasEmptyQuestions) {
      $q.notify({
        type: 'warning',
        message: 'Please fill in all questions before saving'
      })
      saving.value = false
      return
    }

    const eventRef = doc(db, 'events', props.eventId)
    
    const updateData = {
      ratingQuestionsEnabled: questionsEnabled.value,
      questionSetType: questionSetType.value,
      audienceQuestions: audienceQuestions.value,
      feedbackEnabled: feedbackEnabled.value,
      feedbackMaxWords: 200,
      updatedAt: new Date()
    }

    // Only save judgeQuestions if different, otherwise explicitly set to empty array
    if (questionSetType.value === 'different') {
      updateData.judgeQuestions = judgeQuestions.value
    } else {
      // When "same", store empty array to indicate judges use audience questions
      updateData.judgeQuestions = []
    }

    await updateDoc(eventRef, updateData)

    $q.notify({
      type: 'positive',
      message: 'Rating configuration saved successfully!'
    })
  } catch (error) {
    console.error('Error saving questions:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to save questions'
    })
  } finally {
    saving.value = false  // addresses the constantly spinning loader on save button
  }
}

// Load questions on mount
onMounted(() => {
  console.log('RatingQuestions mounted, starting to load questions...')
  console.log('Firebase db object:', db)
  loadQuestions()
})
</script>

<style scoped>
.rating-questions-container {
  max-width: 900px;
  margin: 0 auto;
  border: none !important;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-card {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: move;
  transition: all 0.2s ease;
}

.question-card:hover {
  background-color: rgba(0, 0, 0, 0.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.question-card.dragging {
  opacity: 0.5;
  transform: scale(0.98);
}

.question-card.drag-over {
  border-top: 3px solid var(--q-primary);
  margin-top: 4px;
}

.drag-handle {
  cursor: move;
  transition: color 0.2s ease;
}

.question-card:hover .drag-handle {
  color: var(--q-primary) !important;
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

.full-width {
  width: 100%;
}
</style>