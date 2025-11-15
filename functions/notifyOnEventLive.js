'use strict'

const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { defineSecret } = require('firebase-functions/params')
const sgMail = require('@sendgrid/mail')

const db = getFirestore()
const sendgridApiKey = defineSecret('SENDGRID_API_KEY')

exports.notifyOnEventLive = onDocumentUpdated(
  { document: 'events/{eventId}', secrets: [sendgridApiKey] },
  async (event) => {
    // ✅ Get before and after data
    const beforeData = event.data.before.data()
    const afterData = event.data.after.data()

    if (!beforeData || !afterData) return

    // ✅ Only trigger if status changed from 'setup' to 'live'
    if (beforeData.status !== 'setup' || afterData.status !== 'live') {
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
      type: 'event_live',
      title: 'Event is now Live',
      message: `Your event "${name}" (Code: ${eventId}) is now Live!`,
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
        subject: `Your event "${name}" is now Live!`,
        html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #007bff;">Your Event is Live!</h2>
      <p>Your event <strong>${name}</strong> is now live and ready for participants!</p>
      <p><strong>Event Code:</strong> ${eventId}</p>
      <p>Share this code with your participants so they can join your event.</p>
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
