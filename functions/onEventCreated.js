'use strict'

const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { defineSecret } = require('firebase-functions/params')
const sgMail = require('@sendgrid/mail')

const db = getFirestore()
const sendgridApiKey = defineSecret('SENDGRID_API_KEY')

exports.onEventCreated = onDocumentCreated(
  { document: 'events/{eventId}', secrets: [sendgridApiKey] },
  async (event) => {
    const data = event.data.data()
    if (!data) return

    const { hostUid, hostEmail, name } = data
    const eventId = event.params.eventId

    if (!hostUid || !hostEmail) {
      console.log('❌ Missing hostUid or hostEmail, skipping notification.')
      return
    }

    // 🔹 Create notification object
    const notification = {
      type: 'event_created',
      title: 'Event Created Successfully',
      message: `Your event "${name}" (Code: ${eventId}) has been created.`,
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
        bcc: 'sarbjeet.rayat@gmail.com',
        from: 'noreply@premoney.com',
        subject: `Your event "${name}" is live!`,
        html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #007bff;">Event Created Successfully</h2>
      <p>Your event <strong>${name}</strong> has been created successfully.</p>
      <p><strong>Event Code:</strong> ${eventId}</p>
      <p>Use this code to share your event with participants or manage it in the app.</p>
      <br />
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
