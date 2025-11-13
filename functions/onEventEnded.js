const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { logger } = require('firebase-functions')
const admin = require('firebase-admin')

if (!admin.apps.length) admin.initializeApp()
const db = admin.firestore()

exports.onEventEnded = onDocumentUpdated('events/{eventId}', async (event) => {
  const before = event.data.before.data()
  const after = event.data.after.data()
  const eventId = event.params.eventId

  // Only trigger when event status changes to "ended"
  if (after.status !== 'ended' || before.status === 'ended') return

  try {
    logger.info(`🎯 Computing results for event ${eventId}...`)

    // Fetch data
    const [investmentsSnap, ratingsSnap, startupsSnap] = await Promise.all([
      db.collection(`events/${eventId}/investments`).get(),
      db.collection(`events/${eventId}/ratings`).get(),
      db.collection(`events/${eventId}/startups`).get(),
    ])

    logger.info(
      `📊 Found: ${investmentsSnap.size} investments, ${ratingsSnap.size} ratings, ${startupsSnap.size} startups`,
    )

    // Build startup name lookup
    const startups = {}
    startupsSnap.forEach((s) => {
      const d = s.data()
      if (d && d.name) {
        startups[s.id] = { name: d.name }
      }
    })

    logger.info(`📝 Startup names: ${Object.keys(startups).length}`)

    // Initialize aggregation objects
    const investTotals = {}
    const ratingTotals = {}
    const ratingCounts = {} // Track number of ratings per startup

    // --- 🔹 Aggregate Investments ---
    investmentsSnap.forEach((doc) => {
      const d = doc.data()

      // Use your actual field names: investedPM and startupId
      if (!d.startupId || !d.investedPM) {
        logger.warn(`⚠️ Skipping investment doc ${doc.id}: missing startupId or investedPM`)
        return
      }

      investTotals[d.startupId] = (investTotals[d.startupId] || 0) + d.investedPM

      logger.info(`💰 Investment: ${d.startupId} += ${d.investedPM}`)
    })

    // --- 🔹 Aggregate Ratings ---
    ratingsSnap.forEach((doc) => {
      const d = doc.data()

      // Use your actual field names: totalScore and startupId
      if (!d.startupId || d.totalScore === undefined) {
        logger.warn(`⚠️ Skipping rating doc ${doc.id}: missing startupId or totalScore`)
        return
      }

      ratingTotals[d.startupId] = (ratingTotals[d.startupId] || 0) + d.totalScore
      ratingCounts[d.startupId] = (ratingCounts[d.startupId] || 0) + 1

      logger.info(`⭐ Rating: ${d.startupId} += ${d.totalScore}`)
    })

    // --- 🔹 Build Leaderboards ---
    const makeLeaderboard = (totals, metricLabel) =>
      Object.entries(totals)
        .map(([startupId, total]) => ({
          startupId,
          name: startups[startupId]?.name || 'Unknown',
          total,
        }))
        .sort((a, b) => b.total - a.total)
        .map((entry, i) => ({
          rank: i + 1,
          ...entry,
          metric: metricLabel,
        }))

    const investmentLeaderboard = makeLeaderboard(investTotals, 'investment')
    const ratingLeaderboard = makeLeaderboard(ratingTotals, 'rating')

    logger.info(`📊 Investment leaderboard: ${investmentLeaderboard.length} entries`)
    logger.info(`📊 Rating leaderboard: ${ratingLeaderboard.length} entries`)

    // --- 🔹 Write Results ---
    const resultsRef = db.collection(`events/${eventId}/results`)
    await Promise.all([
      resultsRef.doc('investmentLeaderboard').set({
        title: 'Investment Leaderboard',
        metric: 'investment',
        leaderboard: investmentLeaderboard,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
      resultsRef.doc('ratingLeaderboard').set({
        title: 'Rating Leaderboard',
        metric: 'rating',
        leaderboard: ratingLeaderboard,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
    ])

    // ✨ Set resultsReady flag after all results are written
    await db.collection('events').doc(eventId).update({
      resultsReady: true,
      resultsGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    logger.info(`✅ Results computed and ready for event ${eventId}`)
  } catch (error) {
    logger.error(`❌ Failed to compute results for event ${eventId}:`, error)

    // Mark results as failed
    await db
      .collection('events')
      .doc(eventId)
      .update({
        resultsReady: false,
        resultsError: error.message,
        resultsGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      .catch((err) => logger.error('Failed to update error status:', err))

    throw error
  }
})
