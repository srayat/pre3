'use strict'

const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { defineSecret } = require('firebase-functions/params')
const sgMail = require('@sendgrid/mail')

const db = getFirestore()
const sendgridApiKey = defineSecret('SENDGRID_API_KEY')

exports.notifyOnEventEnded = onDocumentUpdated(
  { document: 'events/{eventId}', secrets: [sendgridApiKey] },
  async (event) => {
    // ✅ Get before and after data
    const beforeData = event.data.before.data()
    const afterData = event.data.after.data()

    // Only trigger when event status changes to "ended"
    if (!beforeData || !afterData) return

    // ✅ Only trigger if status changed from 'live' to 'ended'
    if (beforeData.status !== 'live' || afterData.status !== 'ended') {
      console.log(`⏭️ Skipping - status change was ${beforeData.status} → ${afterData.status}`)
      return
    }

    const { hostUid, hostEmail, name } = afterData
    const eventId = event.params.eventId

    if (!hostUid || !hostEmail) {
      console.log('❌ Missing hostUid or hostEmail, skipping notification.')
      return
    }

    // 🔹 Create notification object
    const notification = {
      type: 'event_ended',
      title: 'Event has ended',
      message: `Your event "${name}" (Code: ${eventId}) has ended`,
      eventId,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    }

    try {
      // Root-level notification (for system logs)
      const notifRef = await db.collection('notifications').add({
        ...notification,
        userUid: hostUid,
      })

      // Mirror notification under user's collection
      await db
        .collection('users')
        .doc(hostUid)
        .collection('notifications')
        .doc(notifRef.id)
        .set(notification)

      console.log(`✅ Notification written to both root and /users/${hostUid}/notifications`)
    } catch (err) {
      console.error('Error writing notifications:', err)
    }

    // 🔹 Send email confirmation via SendGrid
    try {
      sgMail.setApiKey(sendgridApiKey.value())
      await sgMail.send({
        to: hostEmail,
        bcc: 'sarbjeetrayat@gmail.com',
        from: 'noreply@premoney.com',
        subject: `Your event "${name}" has ended`,
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #007bff;">Your Event has ended</h2>
          <p>Your event <strong>${name}</strong> has now ended and ready for results.</p>
          <p>— The Pre Team</p>
        </div>
      `,
      })

      console.log(`📧 Email sent to ${hostEmail}`)
    } catch (err) {
      console.error('Error sending email:', err)
    }
  },
)
