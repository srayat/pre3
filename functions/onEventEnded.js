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

    // Build startup name lookup
    const startups = {}
    startupsSnap.forEach((s) => {
      const d = s.data()
      if (d && d.name) {
        startups[s.id] = { name: d.name }
      }
    })

    // Initialize aggregation objects
    const investTotals = { investor: {}, judge: {} }
    const ratingTotals = { investor: {}, judge: {} }

    // --- 🔹 Aggregate Investments ---
    investmentsSnap.forEach((doc) => {
      const d = doc.data()
      if (!d.startupId || !d.amount || !d.role) return
      if (d.role !== 'judge' && d.role !== 'investor') return

      investTotals[d.role][d.startupId] = (investTotals[d.role][d.startupId] || 0) + d.amount
    })

    // --- 🔹 Aggregate Ratings ---
    ratingsSnap.forEach((doc) => {
      const d = doc.data()
      if (!d.startupId || !d.rating || !d.role) return
      if (d.role !== 'judge' && d.role !== 'investor') return

      ratingTotals[d.role][d.startupId] = (ratingTotals[d.role][d.startupId] || 0) + d.rating
    })

    // --- 🔹 Build Leaderboards ---
    const makeLeaderboard = (totals, role, metricLabel) =>
      Object.entries(totals[role])
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
          role,
        }))

    const startupInvestmentInvestor = makeLeaderboard(investTotals, 'investor', 'investment')
    const startupInvestmentJudge = makeLeaderboard(investTotals, 'judge', 'investment')
    const startupRatingInvestor = makeLeaderboard(ratingTotals, 'investor', 'rating')
    const startupRatingJudge = makeLeaderboard(ratingTotals, 'judge', 'rating')

    // --- 🔹 Write Results ---
    const resultsRef = db.collection(`events/${eventId}/results`)
    await Promise.all([
      resultsRef.doc('startupInvestmentInvestor').set({
        title: 'Startup Leaderboard – Investor Investment',
        metric: 'investment',
        role: 'investor',
        leaderboard: startupInvestmentInvestor,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
      resultsRef.doc('startupInvestmentJudge').set({
        title: 'Startup Leaderboard – Judge Investment',
        metric: 'investment',
        role: 'judge',
        leaderboard: startupInvestmentJudge,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
      resultsRef.doc('startupRatingInvestor').set({
        title: 'Startup Leaderboard – Investor Ratings',
        metric: 'rating',
        role: 'investor',
        leaderboard: startupRatingInvestor,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
      resultsRef.doc('startupRatingJudge').set({
        title: 'Startup Leaderboard – Judge Ratings',
        metric: 'rating',
        role: 'judge',
        leaderboard: startupRatingJudge,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
    ])

    logger.info(`✅ Results computed for event ${eventId}`)
  } catch (error) {
    logger.error(`❌ Failed to compute results for event ${eventId}:`, error)
    throw error
  }
})
