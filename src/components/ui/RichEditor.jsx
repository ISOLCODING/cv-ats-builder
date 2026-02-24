// src/components/ui/RichEditor.jsx
// ============================================================
// Modern TipTap Rich Text Editor
// Features: Bold, Italic, Underline, Bullet list, Numbered list,
//           Text align, Character count, Placeholder
// ============================================================

import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

// ── Toolbar icons (inline SVG untuk zero dependencies) ───────
const icons = {
  bold: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
    </svg>
  ),
  italic: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>
    </svg>
  ),
  underline: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>
    </svg>
  ),
  ul: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
      <circle cx="4.5" cy="6" r="1.5" fill="currentColor"/><circle cx="4.5" cy="12" r="1.5" fill="currentColor"/><circle cx="4.5" cy="18" r="1.5" fill="currentColor"/>
    </svg>
  ),
  ol: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
      <path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
    </svg>
  ),
  alignLeft: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>
    </svg>
  ),
  undo: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6"/><path d="M3 13C5.5 7 12 5 18 9s7 14 1 18"/>
    </svg>
  ),
  redo: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7v6h-6"/><path d="M21 13C18.5 7 12 5 6 9S-1 23 5 27"/>
    </svg>
  ),
};

// ── Toolbar button ─────────────────────────────────────────────
function ToolBtn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick?.(); }}
      className={`tiptap-btn ${active ? 'active' : ''}`}
      disabled={disabled}
      title={title}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

// ── Main RichEditor ────────────────────────────────────────────
export default function RichEditor({
  value = '',
  onChange,
  placeholder = 'Tulis di sini...',
  minHeight = 120,
  maxLength = 2000,
  error = false,
  label,
  required,
  helper,
  className = '',
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        blockquote: false,
      }),
      Underline,
      TextAlign.configure({ types: ['paragraph'] }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      // Kirim HTML ke parent
      const html = editor.isEmpty ? '' : editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror',
      },
    },
  });

  // Sync value dari luar (misal load CV)
  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    if (value !== currentHTML && value !== undefined) {
      // Hanya update jika berbeda signifikan
      if (value === '' && !editor.isEmpty) {
        editor.commands.clearContent(true);
      } else if (value && value !== currentHTML) {
        editor.commands.setContent(value, false);
      }
    }
  }, [value, editor]);

  const charCount = editor?.storage?.characterCount?.characters() ?? 0;
  const percent = Math.min(100, (charCount / maxLength) * 100);
  const isNear = percent > 80;
  const isOver = percent >= 100;

  if (!editor) return null;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Editor wrapper */}
      <div className={`tiptap-wrapper ${error ? 'error' : ''}`}>
        
        {/* ── Toolbar ─────────────────────────────────────── */}
        <div className="tiptap-toolbar">
          {/* Text formatting */}
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            {icons.bold}
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            {icons.italic}
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            {icons.underline}
          </ToolBtn>

          <div className="tiptap-divider" />

          {/* Lists */}
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet list"
          >
            {icons.ul}
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered list"
          >
            {icons.ol}
          </ToolBtn>

          <div className="tiptap-divider" />

          {/* Alignment */}
          <ToolBtn
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Align left"
          >
            {icons.alignLeft}
          </ToolBtn>

          <div className="tiptap-divider" />

          {/* Undo/Redo */}
          <ToolBtn
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            {icons.undo}
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            {icons.redo}
          </ToolBtn>
        </div>

        {/* ── Content area ─────────────────────────────────── */}
        <div
          className="tiptap-content"
          style={{ minHeight: `${minHeight}px` }}
          onClick={() => editor.commands.focus()}
        >
          <EditorContent editor={editor} />
        </div>

        {/* ── Footer: char count ───────────────────────────── */}
        <div className="tiptap-footer">
          <div className="char-bar">
            <div
              className={`char-bar-fill ${isOver ? 'over' : isNear ? 'near' : ''}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className={`tiptap-count ${isOver ? 'at-limit' : isNear ? 'near-limit' : ''}`}>
            {charCount}/{maxLength}
          </span>
        </div>
      </div>

      {/* Helper/Error */}
      {error && typeof error === 'string' && (
        <p className="form-error">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}
      {helper && !error && <p className="form-helper">{helper}</p>}
    </div>
  );
}
