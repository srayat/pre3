'use strict'

const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { defineSecret } = require('firebase-functions/params')
const sgMail = require('@sendgrid/mail')

const sendgridApiKey = defineSecret('SENDGRID_API_KEY')

exports.notifyOnUserCreate = onDocumentCreated(
  {
    document: 'users/{userId}',
    secrets: [sendgridApiKey],
  },
  async (event) => {
    const userData = event.data.data()

    if (!userData) return

    const { email } = userData

    if (!email) {
      console.log('No email found for user')
      return
    }

    // 📧 Send admin notification email
    try {
      sgMail.setApiKey(sendgridApiKey.value())
      await sgMail.send({
        to: 'sarbjeetrayat@gmail.com',
        from: 'noreply@premoney.com',
        subject: `New user signed up: ${email}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #007bff;">New User Signed Up</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <br />
            <p>— The Pre Team</p>
          </div>
        `,
      })
      console.log(`📧 Admin notification sent for ${email}`)
    } catch (err) {
      console.error('Error sending admin notification:', err)
    }
  },
)
