// src/utils/htmlToReactPdf.js
// ============================================================
// Konversi HTML string dari TipTap ke elemen @react-pdf/renderer
// CATATAN: File ini sengaja TIDAK menggunakan JSX syntax
//          agar bisa berjalan sebagai file .js biasa di Vite.
//          Gunakan React.createElement() langsung.
// ============================================================

import React from 'react';
import { Text, View } from '@react-pdf/renderer';

const ce = React.createElement;

/**
 * htmlToReactPdf
 * @param {string} html       — HTML dari TipTap
 * @param {object} baseStyle  — style dasar teks
 * @returns {React.ReactNode|null}
 */
export function htmlToReactPdf(html, baseStyle = {}) {
  if (!html || !html.trim()) return null;

  // Plain text — tidak ada tag HTML
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return ce(Text, { style: baseStyle }, html);
  }

  const parser = new DOMParser();
  const doc    = parser.parseFromString(html, 'text/html');
  const nodes  = Array.from(doc.body.childNodes);

  const elements = nodes
    .map((node, i) => parseBlock(node, baseStyle, i))
    .filter(Boolean);

  if (!elements.length) return null;
  return ce(View, null, ...elements);
}

// ── Block-level nodes ────────────────────────────────────────
function parseBlock(node, base, key) {
  // Text node
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent.trim();
    return t ? ce(Text, { key, style: base }, t) : null;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const tag      = node.tagName.toLowerCase();
  const children = Array.from(node.childNodes);

  switch (tag) {
    case 'p': {
      const inlines = parseInlines(children, base);
      const content = node.textContent.trim();
      if (!content) return null;
      return ce(
        Text,
        { key, style: { ...base, marginBottom: 2 } }, // Dikurangi dari 3
        ...(inlines.length ? inlines : [content])
      );
    }

    case 'ul': {
      const items = Array.from(node.querySelectorAll('li'));
      return ce(
        View,
        { key, style: { marginBottom: 2 } }, // Dikurangi dari 3
        ...items.map((li, j) => {
          const inlines = parseInlines(Array.from(li.childNodes), base);
          const text    = li.textContent.trim();
          return ce(
            View,
            { key: j, style: { flexDirection: 'row', marginBottom: 1 } },
            ce(Text, { style: { ...base, width: 14, flexShrink: 0 } }, '\u2022'),
            ce(
              Text,
              { style: { ...base, flex: 1 } },
              ...(inlines.length ? inlines : [text])
            )
          );
        })
      );
    }

    case 'ol': {
      const items = Array.from(node.querySelectorAll('li'));
      return ce(
        View,
        { key, style: { marginBottom: 2 } }, // Dikurangi dari 3
        ...items.map((li, j) => {
          const inlines = parseInlines(Array.from(li.childNodes), base);
          const text    = li.textContent.trim();
          return ce(
            View,
            { key: j, style: { flexDirection: 'row', marginBottom: 1 } },
            ce(Text, { style: { ...base, width: 16, flexShrink: 0 } }, `${j + 1}.`),
            ce(
              Text,
              { style: { ...base, flex: 1 } },
              ...(inlines.length ? inlines : [text])
            )
          );
        })
      );
    }

    case 'br':
      return ce(Text, { key, style: base }, '\n');

    case 'h1':
    case 'h2':
    case 'h3': {
      const boldStyle = { ...base, fontFamily: 'Times-Bold', marginBottom: 3 };
      const inlines   = parseInlines(children, boldStyle);
      const text      = node.textContent.trim();
      return ce(Text, { key, style: boldStyle }, ...(inlines.length ? inlines : [text]));
    }

    default: {
      // Fallback: render sebagai teks
      const inlines = parseInlines(children, base);
      const text    = node.textContent.trim();
      if (!text) return null;
      return ce(Text, { key, style: base }, ...(inlines.length ? inlines : [text]));
    }
  }
}

// ── Inline nodes (bold, italic, dll.) ───────────────────────
function parseInlines(nodes, base) {
  return nodes
    .map((node, i) => parseInline(node, base, i))
    .filter(Boolean);
}

function parseInline(node, base, key) {
  // Text node
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent;
    return t ? ce(Text, { key, style: base }, t) : null;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const tag      = node.tagName.toLowerCase();
  const children = Array.from(node.childNodes);

  switch (tag) {
    case 'strong':
    case 'b': {
      const s = { ...base, fontFamily: 'Times-Bold' };
      return ce(Text, { key, style: s }, ...parseInlines(children, s));
    }

    case 'em':
    case 'i': {
      const s = { ...base, fontFamily: 'Times-Italic' };
      return ce(Text, { key, style: s }, ...parseInlines(children, s));
    }

    case 'u':
      return ce(
        Text,
        { key, style: { ...base, textDecoration: 'underline' } },
        ...parseInlines(children, base)
      );

    case 's':
    case 'del':
      return ce(
        Text,
        { key, style: { ...base, textDecoration: 'line-through' } },
        ...parseInlines(children, base)
      );

    case 'br':
      return ce(Text, { key, style: base }, '\n');

    case 'p': {
      const inlines = parseInlines(children, base);
      const t = node.textContent;
      return ce(Text, { key, style: base }, ...(inlines.length ? inlines : [t]));
    }

    default: {
      const inlines = parseInlines(children, base);
      const t = node.textContent;
      return t || inlines.length
        ? ce(Text, { key, style: base }, ...(inlines.length ? inlines : [t]))
        : null;
    }
  }
}
