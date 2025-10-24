"use strict"

const {onRequest} = require("firebase-functions/v2/https")
const {getApps, initializeApp} = require("firebase-admin/app")

if (!getApps().length) {
  initializeApp()
}

exports.helloWorld = onRequest((req, res) => {
  res.status(200).send("Hello from Firebase!")
})
