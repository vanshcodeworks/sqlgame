import { copyFileSync } from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// sql.js ships separate .wasm binaries per build variant. Vite's dev-time
// pre-bundling (esbuild) resolves the "browser" package.json export
// condition (sql-wasm-browser.js), which requests sql-wasm-browser.wasm at
// runtime; a production `vite build` may end up on either variant. Copy
// both into public/ so whichever gets requested is actually there.
const variants = ['sql-wasm.wasm', 'sql-wasm-browser.wasm']

for (const file of variants) {
  copyFileSync(require.resolve(`sql.js/dist/${file}`), `public/${file}`)
}
