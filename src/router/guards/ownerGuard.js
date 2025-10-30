import { getAuth } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from 'boot/firebase'

export async function ownerGuard(to, from, next) {
  const auth = getAuth()
  const user = auth.currentUser

  if (!user) {
    next('/sign-in')
    return
  }

  const startupId = to.params.id
  const snap = await getDoc(doc(db, 'startups', startupId))

  if (!snap.exists()) {
    next('/404')
    return
  }

  const data = snap.data()
  if (data.owners && data.owners.includes(user.uid)) {
    next()
  } else {
    next('/unauthorized') // optional: create a friendly "Access Denied" page
  }
}
