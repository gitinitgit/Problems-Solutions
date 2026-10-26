import { Marked } from 'marked'
import hljs from 'highlight.js/lib/core'

// Register languages we care about (tree-shakeable)
import cpp from 'highlight.js/lib/languages/cpp'
import java from 'highlight.js/lib/languages/java'
import python from 'highlight.js/lib/languages/python'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import c from 'highlight.js/lib/languages/c'
import csharp from 'highlight.js/lib/languages/csharp'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import kotlin from 'highlight.js/lib/languages/kotlin'
import swift from 'highlight.js/lib/languages/swift'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import sql from 'highlight.js/lib/languages/sql'
import xml from 'highlight.js/lib/languages/xml'

hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('java', java)
hljs.registerLanguage('python', python)
hljs.registerLanguage('python3', python)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('c', c)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('kotlin', kotlin)
hljs.registerLanguage('swift', swift)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)

// ── Exports preserved from original ────────────────────────────────────
export const LANGS = [
  ['cpp', 'C++'], ['java', 'Java'], ['python3', 'Python3'],
  ['javascript', 'JavaScript'], ['typescript', 'TypeScript'],
  ['c', 'C'], ['csharp', 'C#'], ['go', 'Go'], ['rust', 'Rust'],
  ['kotlin', 'Kotlin'], ['swift', 'Swift'],
]
export const langLabel = (l) => (LANGS.find((x) => x[0] === l) || [0, l])[1]

// ── SVG icons ──────────────────────────────────────────────────────────
const COPY_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`
const CHECK_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4caf7d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`

// ── Copy-code handler (unchanged API) ──────────────────────────────────
export const onCopyClick = (e) => {
  const b = e.target.closest('.cp')
  if (!b) return
  const pre = b.parentElement.querySelector('pre')
  if (navigator.clipboard && pre) navigator.clipboard.writeText(pre.textContent)
  b.innerHTML = CHECK_ICON
  setTimeout(() => (b.innerHTML = COPY_ICON), 1200)
}

// ── Escape helper for the $math$ post-processor ────────────────────────
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ── Build a Marked instance with highlight.js code renderer ────────────
const parser = new Marked({
  gfm: true,
  breaks: false,
  pedantic: false,
})

parser.use({
  renderer: {
    // ── Code blocks: syntax highlighting + copy button ─────────────
    code({ text, lang }) {
      // Strip extra metadata like ` []` that the editor template appends
      const rawLang = (lang || '').trim()
      const cleanLang = rawLang.split(/[\s[]/)[0].toLowerCase()

      let highlighted = ''
      if (cleanLang && hljs.getLanguage(cleanLang)) {
        try {
          highlighted = hljs.highlight(text, { language: cleanLang, ignoreIllegals: true }).value
        } catch (_) {
          highlighted = escHtml(text)
        }
      } else if (!cleanLang || cleanLang === 'text' || cleanLang === 'plain') {
        highlighted = escHtml(text)
      } else {
        // Unknown language – let highlight.js guess
        try {
          highlighted = hljs.highlightAuto(text).value
        } catch (_) {
          highlighted = escHtml(text)
        }
      }

      return `<div class="cb"><button class="cp" type="button" aria-label="Copy code">${COPY_ICON}</button><pre><code class="hljs${cleanLang ? ` language-${cleanLang}` : ''}">${highlighted}</code></pre></div>\n`
    },

    // ── Tables: wrap in scrollable container ────────────────────────
    table(token) {
      let headerHtml = ''
      for (const cell of token.header) {
        const alignAttr = cell.align ? ` align="${cell.align}"` : ''
        headerHtml += `<th${alignAttr}>${this.parser.parseInline(cell.tokens)}</th>`
      }

      let bodyHtml = ''
      for (const row of token.rows) {
        let rowHtml = ''
        for (const cell of row) {
          const alignAttr = cell.align ? ` align="${cell.align}"` : ''
          rowHtml += `<td${alignAttr}>${this.parser.parseInline(cell.tokens)}</td>`
        }
        bodyHtml += `<tr>${rowHtml}</tr>\n`
      }

      return `<div class="table-wrap"><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>\n`
    },

    // ── Inline code ────────────────────────────────────────────────
    codespan({ text }) {
      return `<code>${escHtml(text)}</code>`
    },
  },
})

// ── Main export: Markdown string → safe HTML string ────────────────────
export function md(src) {
  if (!src) return ''

  // 1. Normalize line-endings (Windows \r\n, old Mac \r → Unix \n)
  let normalized = src.replace(/\r\n?/g, '\n')

  // 2. Strip HTML comments (mirrors old behaviour)
  normalized = normalized.replace(/<!--[\s\S]*?-->/g, '')

  // 3. Parse with marked (GFM tables, code fences, lists, etc.)
  let html = parser.parse(normalized)

  // 4. Post-process: simple $math$ → <span class="math">
  //    Handles both $inline$ and $$block$$ (display math placeholder)
  html = html.replace(/\$\$([^$]+?)\$\$/g, '<span class="math display">$1</span>')
  html = html.replace(/\$([^$\n]+?)\$/g, '<span class="math">$1</span>')

  return html
}
