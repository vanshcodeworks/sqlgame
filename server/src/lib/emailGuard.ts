/**
 * Server-side signup abuse guard.
 *
 * The browser has its own copy in client/src/lib/emailValidator.ts for instant
 * feedback, but that is trivially bypassed — the server must enforce the same
 * rules because it is the only trusted layer in the signup path.
 */

const DISPOSABLE_DOMAINS = new Set([
  // Classic disposable providers
  'mailinator.com', 'mailinator.net', 'guerrillamail.com', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamail.biz', 'guerrillamail.de',
  'guerrillamailblock.com', 'sharklasers.com', 'grr.la', 'spam4.me',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tmpmail.net', 'tmpmail.org',
  'tempemail.co', 'tempemail.net', 'tempemail.com', 'mail-temp.com',
  'throwam.com', 'throwaway.email', 'throwam.me', 'dispostable.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.fr.nf',
  'nospam.ze.tc', 'nomail.xl.cx', 'mega.zik.dj', 'speed.1s.fr',
  'courriel.fr.nf', 'moncourrier.fr.nf', 'monemail.fr.nf', 'monmail.fr.nf',
  'trashmail.at', 'trashmail.com', 'trashmail.io', 'trashmail.me',
  'trashmail.net', 'trashmail.org', 'trashmail.xyz', 'mailnull.com',
  'maildrop.cc', 'mailnesia.com', 'mailsac.com', 'mailhazard.com',
  'mailexpire.com', 'getonemail.com', 'inboxbear.com', 'minutemail.com',
  'minutemail.de', 'minuteinbox.com', 'safetymail.info', 'safe-mail.net',
  'spamgob.com', 'spam.su', 'gufum.com', 'mohmal.com', 'airmail.cc',
  'armyspy.com', 'cuvox.de', 'dayrep.com', 'einrot.com', 'fleckens.hu',
  'gustr.com', 'jourrapide.com', 'rhyta.com', 'superrito.com',
  'teleworm.us', 'tmail.com', 'tmail.io', 'tmail.ws', 'tmpinbox.com',
  'turual.com', 'uvoxmail.com', 'vomoto.com', 'wegwerfmail.de',
  'wegwerfmail.net', 'wegwerfmail.org', 'wpdfs.com', 'zehnminuten.de',
  'zehnminutenmail.de', '10minutemail.com', '10minutemail.net',
  '10minutemail.org', '10minute-mail.com', '10minutemail.co.za',
  '10minutmail.com', '20minutemail.com', '33mail.com', 'filzmail.com',
  'getnada.com', 'getairmail.com', 'fakeinbox.com', 'fakeinbox.net',
  'mytemp.email', 'tempr.email', 'discard.email', 'discardmail.com',
  'discardmail.de', 'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org',
  'spamfree24.org', 'spamfree24.de', 'spamfree24.eu', 'spam.la',
  'spamcorptastic.com', 'spamchi.com', 'spamfob.com', 'spamoff.de',
  'spaml.de', 'spamspot.com', 'spamstack.net',
])

// Domains Supabase itself rejects, plus obvious placeholders.
const INVALID_DOMAINS = new Set([
  'example.com', 'example.org', 'example.net', 'test.com', 'localhost',
  'invalid', 'domain.com', 'email.com', 'mail.com', 'yourdomain.com',
])

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export interface EmailCheck {
  ok: boolean
  reason?: string
  domain?: string
}

export function checkSignupEmail(rawEmail: unknown): EmailCheck {
  if (typeof rawEmail !== 'string') return { ok: false, reason: 'Email is required.' }

  const email = rawEmail.trim().toLowerCase()
  if (email.length > 254) return { ok: false, reason: 'Email is too long.' }
  if (!EMAIL_RE.test(email)) return { ok: false, reason: 'Invalid email format.' }

  const parts = email.split('@')
  if (parts.length !== 2) return { ok: false, reason: 'Invalid email format.' }

  // Reject weird local parts and plus-addressing tricks used to evade limits.
  const local = parts[0]
  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return { ok: false, reason: 'Invalid email format.' }
  }
  if ((local.match(/\+/g) ?? []).length > 2) {
    return { ok: false, reason: 'Too many email aliases are not allowed.' }
  }

  const domain = parts[1]

  // Walk up the labels: block subdomains of disposable providers too.
  const labels = domain.split('.')
  for (let i = 0; i < labels.length - 1; i++) {
    const candidate = labels.slice(i).join('.')
    if (DISPOSABLE_DOMAINS.has(candidate)) {
      return { ok: false, reason: 'Temporary or disposable email addresses are not allowed.', domain }
    }
  }

  if (INVALID_DOMAINS.has(domain)) {
    return { ok: false, reason: 'That email domain is not allowed.', domain }
  }

  return { ok: true, domain }
}

/** Minimum bar: 8+ chars, at least one letter and one number. */
export function checkPassword(password: unknown): { ok: boolean; reason?: string } {
  if (typeof password !== 'string') return { ok: false, reason: 'Password is required.' }
  if (password.length < 8) return { ok: false, reason: 'Password must be at least 8 characters.' }
  if (password.length > 128) return { ok: false, reason: 'Password is too long.' }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { ok: false, reason: 'Password must contain letters and numbers.' }
  }
  return { ok: true }
}
