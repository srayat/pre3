/**
 * Firebase Functions Entry Point
 */

const { onCall } = require('firebase-functions/v2/https')

// ✅ Initialize Firebase Admin SDK FIRST
const { getApps, initializeApp } = require('firebase-admin/app')
if (!getApps().length) initializeApp()

// ✅ THEN import custom functions that use Firestore
const { sendFounderInvite } = require('./sendFounderInvite')
const { createEvent, testAddUserDoc } = require('./createEvent')
const { getHostEvents } = require('./getHostEvents')
const { defineSecret } = require('firebase-functions/params')
const sendgridApiKey = defineSecret('SENDGRID_API_KEY')
const { createStartup } = require('./createStartup')
const { updateStartup } = require('./updateStartup')
const { deleteStartup } = require('./deleteStartup')

// ✅ Export modular functions (v1 style)
exports.reservePersonByEmail = require('./reservePersonByEmail').reservePersonByEmail
exports.linkUserToPerson = require('./onUserCreate').linkUserToPerson
exports.helloWorld = require('./helloWorld').helloWorld
exports.logStartupNameChange = require('./logStartupNameChange').logStartupNameChange
exports.onEventCreated = require('./onEventCreated').onEventCreated
exports.joiningPremoney = require('./joiningPremoney').joiningPremoney
exports.onEventEnded = require('./onEventEnded').onEventEnded
exports.notifyOnUserCreate = require('./notifyOnUserCreate').notifyOnUserCreate
exports.testNotifications = require('./testNotifications').testNotifications

// ✅ Export v2 callable functions
exports.getHostEvents = onCall({ cors: true }, getHostEvents)
exports.createEvent = onCall({ cors: true }, createEvent)
exports.testAddUserDoc = onCall({ cors: true }, testAddUserDoc)

exports.sendFounderInvite = onCall({ cors: true, secrets: [sendgridApiKey] }, sendFounderInvite)
exports.createStartup = onCall({ cors: true }, createStartup)
exports.updateStartup = onCall({ cors: true }, updateStartup)
exports.deleteStartup = onCall({ cors: true }, deleteStartup)
