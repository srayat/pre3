/**
 * Firebase Functions Entry Point
 */

const { setGlobalOptions } = require('firebase-functions')
const { onCall } = require('firebase-functions/v2/https')

// ✅ Initialize Firebase Admin SDK FIRST
const admin = require('firebase-admin')
admin.initializeApp()

// ✅ THEN import custom functions that use Firestore
const { sendFounderInvite } = require('./sendFounderInvite')
const { createEvent, testAddUserDoc } = require('./createEvent')
const { getHostEvents } = require("./getHostEvents");
const { 
  testWriteUserDoc, 
  testWriteUserSubcollection, 
  testReadUserDoc,
  testBatchWrite 
} = require('./testUserWrite');
const { defineSecret } = require('firebase-functions/params');
const sendgridApiKey = defineSecret('SENDGRID_API_KEY');


// Optional global options for cost control
setGlobalOptions({ maxInstances: 10 })

// ✅ Export modular functions (v1 style)
exports.reservePersonByEmail = require('./reservePersonByEmail').reservePersonByEmail
exports.linkUserToPerson = require('./onUserCreate').linkUserToPerson
exports.helloWorld = require('./helloWorld').helloWorld
exports.logStartupNameChange = require('./logStartupNameChange').logStartupNameChange

// ✅ Export v2 callable functions
exports.sendFounderInvite = onCall({ cors: true }, sendFounderInvite)
exports.getHostEvents = onCall({ cors: true }, getHostEvents);
exports.createEvent = onCall({ cors: true }, createEvent);
exports.testAddUserDoc = onCall({ cors: true }, testAddUserDoc);

exports.sendFounderInvite = onCall({ cors: true, secrets: [sendgridApiKey]}, sendFounderInvite);

// 🧪 Test functions for debugging /users/ writes
exports.testWriteUserDoc = onCall({ cors: true }, testWriteUserDoc);
exports.testWriteUserSubcollection = onCall({ cors: true }, testWriteUserSubcollection);
exports.testReadUserDoc = onCall({ cors: true }, testReadUserDoc);
exports.testBatchWrite = onCall({ cors: true }, testBatchWrite);





