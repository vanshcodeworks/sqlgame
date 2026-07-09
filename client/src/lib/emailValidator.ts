/**
 * Disposable / temporary email domain blocklist.
 * Runs client-side pre-signup since the Express server no longer sits in
 * the signup path (Supabase Auth is called directly from the browser).
 */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','guerrillamail.net','guerrillamail.org',
  'guerrillamail.biz','guerrillamail.de','guerrillamailblock.com',
  'tempmail.com','temp-mail.org','temp-mail.io','tmpmail.net','tmpmail.org',
  'throwam.com','throwaway.email','throwam.me',
  'yopmail.com','yopmail.fr','cool.fr.nf','jetable.fr.nf','nospam.ze.tc',
  'nomail.xl.cx','mega.zik.dj','speed.1s.fr','courriel.fr.nf',
  'moncourrier.fr.nf','monemail.fr.nf','monmail.fr.nf',
  'dispostable.com','spamgourmet.com','spamgourmet.net','spamgourmet.org',
  'trashmail.at','trashmail.com','trashmail.io','trashmail.me','trashmail.net',
  'trashmail.org','trashmail.xyz',
  'mailnull.com','maildrop.cc','mailnesia.com',
  'sharklasers.com','guerrillamail.info','grr.la',
  'spam4.me','spamfree24.org','spamfree24.de','spamfree24.eu',
  'spam.la','spamcorptastic.com','spamchi.com','spamfob.com',
  'spamoff.de','spaml.de','spamspot.com','spamstack.net',
  'discard.email','discardmail.com','discardmail.de',
  'mytemp.email','tempr.email','fakeinbox.com','fakeinbox.net',
  'mailsac.com','mailhazard.com','mailexpire.com','getonemail.com',
  'mail-temp.com','tempemail.co','tempemail.net','tempemail.com',
  'inboxbear.com','minutemail.com','minutemail.de','minuteinbox.com',
  'safetymail.info','safe-mail.net','spamgob.com','spam.su',
  'gufum.com','mohmal.com','airmail.cc','armyspy.com','cuvox.de',
  'dayrep.com','einrot.com','fleckens.hu','gustr.com','jourrapide.com',
  'rhyta.com','superrito.com','teleworm.us','tmail.com','tmail.io',
  'tmail.ws','tmpinbox.com','turual.com','uvoxmail.com','vomoto.com',
  'wegwerfmail.de','wegwerfmail.net','wegwerfmail.org','wpdfs.com',
  'zehnminuten.de','zehnminutenmail.de','10minutemail.com',
  '10minutemail.net','10minutemail.org','10minute-mail.com',
  '10minutemail.co.za','10minutmail.com','20minutemail.com',
  '33mail.com','filzmail.com','getnada.com','getairmail.com',
])

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

export function validateEmail(email: string): { ok: boolean; reason?: string } {
  if (!EMAIL_RE.test(email)) return { ok: false, reason: 'Invalid email format.' }
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return { ok: false, reason: 'Invalid email format.' }
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, reason: 'Disposable/temporary email addresses are not allowed.' }
  }
  return { ok: true }
}
