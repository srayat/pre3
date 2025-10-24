export function normalizeEmail(email) {
  if (!email) return ''

  let normalized = email.trim().toLowerCase()
  const parts = normalized.split('@')

  if (parts.length !== 2) {
    return normalized
  }

  const [local, domain] = parts

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const baseLocal = local.split('+')[0].replace(/\./g, '')
    normalized = `${baseLocal}@gmail.com`
  }

  return normalized
}

export function isValidEmail(email) {
  if (!email) return false
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email.trim())
}
