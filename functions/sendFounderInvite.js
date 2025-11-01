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