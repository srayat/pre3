'use strict'

const { onDocumentCreated } = require('firebase-functions/v2/firestore')

exports.testNotification = onDocumentCreated(
  {
    document: 'test/{testId}',
  },
  async (event) => {
    console.log('🧪 Test notification fired!')
    console.log('Document data:', event.data.data())
  },
)
