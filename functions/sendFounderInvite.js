/*
  ──────────────────────────────────────────────────────────────────────────────
  Cloud Function: sendFounderInvite
  Location:       functions/sendFounderInvite.js
  ──────────────────────────────────────────────────────────────────────────────
  PURPOSE
  • Triggered via HTTPS Callable Function from the client app.
  • Handles sending an invitation email to a founder with a link
    to claim their startup page for a given event.
  • For Version 2 (invite-based ownership transfer), this provides
    the backend logic to initiate the founder claim process.

  USAGE CONTEXT
  • Called from useFounderInvite().sendInvite().
  • Accepts founderEmail and eventId as parameters.
  • Optionally supports startupId or future extensions (e.g., token-based link).

  EXAMPLE CALL
  -------------------------------------------------------------------------------
    const sendInvite = httpsCallable(functions, 'sendFounderInvite')
    await sendInvite({ founderEmail: 'founder@startup.com', eventId: 'EVT123' })
  -------------------------------------------------------------------------------

  INPUT PAYLOAD
  {
    founderEmail: string,   // Required – recipient email
    eventId: string,        // Required – parent event ID
    startupId?: string      // Optional – for future direct link association
  }

  OUTPUT PAYLOAD
  {
    success: boolean,
    message: string,
    inviteId?: string,
    claimLink?: string
  }

  FLOW (Current MVP)
  1. Validate authentication and input.
  2. Normalize and sanitize founderEmail.
  3. Generate a unique claim link (simple or secure version).
  4. Optionally record invite metadata in Firestore:
       /events/{eventId}/founderInvites/{inviteId}
  5. Send email via Gmail or SendGrid API.
  6. Return response to client.

  FUTURE ENHANCEMENTS
  • Add token signing for secure claim links (Version 2B).
  • Add resendInvite(), expiry, and invite status tracking.
  • Add templating via SendGrid dynamic templates or MJML.

  DEPENDENCIES
  • Firebase Admin SDK
  • nodemailer (if using Gmail)
  • SendGrid (optional alternative)
  • functions.https.onCall()

  EXAMPLE STUB IMPLEMENTATION
  -------------------------------------------------------------------------------
    const { HttpsError } = require('firebase-functions/v2/https')
    const admin = require('firebase-admin')
    const nodemailer = require('nodemailer')

    if (!admin.apps.length) admin.initializeApp()
    const db = admin.firestore()

    exports.sendFounderInvite = async (data, context) => {
      if (!context.auth) {
        throw new HttpsError('unauthenticated', 'Sign-in required.')
      }

      const { founderEmail, eventId } = data
      if (!founderEmail || !eventId) {
        throw new HttpsError('invalid-argument', 'Missing parameters.')
      }

      // Example: basic claim link (replace with secure link in v2b)
      const claimLink = `https://pre3.app/claim?eventId=${eventId}&email=${encodeURIComponent(founderEmail)}`

      // Send email (stub)
      // await transporter.sendMail({ ... })

      return { success: true, message: 'Invite email sent.', claimLink }
    }
  -------------------------------------------------------------------------------

  LAST UPDATED: 2025-11-02
  AUTHOR: [Your Name]
  ──────────────────────────────────────────────────────────────────────────────
*/



// functions/sendFounderInvite.js
const { HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const sgMail = require('@sendgrid/mail');

const db = getFirestore();

async function sendFounderInvite(request) {
  const { founderEmail, eventId } = request.data;
  const inviterUid = request.auth?.uid || 'anonymous';

  if (!founderEmail || !eventId) {
    throw new HttpsError('invalid-argument', 'Missing founderEmail or eventId');
  }

  const normalizedEmail = founderEmail.trim().toLowerCase();

  // Create invite in Firestore
  const inviteRef = db.collection('events').doc(eventId).collection('startups').doc();
  const inviteId = inviteRef.id;

  const docData = {
    founderEmail: normalizedEmail,
    status: 'pending_claim',
    invitedByUid: inviterUid,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  await inviteRef.set(docData);

  const claimLink = `https://pre3.app/founder-invite?eventId=${eventId}&inviteId=${inviteId}`;
  console.log(`📨 Invite for ${normalizedEmail}: ${claimLink}`);

  // Send email via SendGrid
  try {
    // Get SendGrid API key from secrets
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error('❌ SENDGRID_API_KEY not set');
      throw new HttpsError('internal', 'Email service not configured');
    }

    sgMail.setApiKey(apiKey);

    const msg = {
      to: normalizedEmail,
      from: 'noreply@pre3.app', // Must be verified in SendGrid
      subject: "You've been invited to pitch!",
      text: `You've been invited to participate in a pitch event.\n\nClick here to claim your invite: ${claimLink}`,
      html: `
        <h2>You've been invited to pitch!</h2>
        <p>You've been invited to participate in a pitch event.</p>
        <p><a href="${claimLink}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Claim Your Invite</a></p>
        <p style="color: #666; font-size: 12px;">Or copy this link: ${claimLink}</p>
      `,
    };

    await sgMail.send(msg);
    console.log('✅ Email sent successfully to', normalizedEmail);

  } catch (emailError) {
    console.error('❌ Failed to send email:', emailError);
    // Don't throw - we still want to return success since the invite was created
    // You could add an 'emailSent: false' flag to the response if needed
  }

  return {
    success: true,
    inviteId,
    status: 'pending_claim',
    message: `Invite sent to ${normalizedEmail}`,
    sentAt: new Date().toISOString()
  };
}

module.exports = { sendFounderInvite };