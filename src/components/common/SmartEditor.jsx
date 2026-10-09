/**
 * components/common/SmartEditor.jsx
 * 간단한 스마트 에디터 — Bold/Italic/Underline/목록/링크/인라인 이미지
 * 저장 포맷: HTML 문자열 (onChange(html) 로 전달)
 */
import React, { useRef, useEffect, useCallback, useState } from 'react'

const BTN = ({ title, icon, onMouseDown, active }) => (
  <button
    type="button"
    title={title}
    onMouseDown={onMouseDown}
    style={{
      width: 30, height: 28,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: `1.5px solid ${active ? 'var(--c-primary)' : 'var(--c-border)'}`,
      borderRadius: 6,
      background: active ? 'var(--c-primary-light)' : 'transparent',
      color: active ? 'var(--c-primary)' : 'var(--c-text)',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 600,
      transition: 'all .15s',
      flexShrink: 0,
    }}
  >{icon}</button>
)

const SEP = () => (
  <div style={{ width: 1, height: 18, background: 'var(--c-border)', margin: '0 2px', flexShrink: 0 }} />
)

/* 이미지를 WebP + 1024×768 이하로 변환 (Canvas) */
async function toWebpBlob(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const objUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objUrl)
      const MAX_W = 1024, MAX_H = 768
      let { naturalWidth: w, naturalHeight: h } = img
      if (w > MAX_W || h > MAX_H) {
        const ratio = Math.min(MAX_W / w, MAX_H / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.85)
    }
    img.src = objUrl
  })
}

/* Supabase 업로드 */
async function uploadInlineImage(file) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const webpBlob    = await toWebpBlob(file)
  const id          = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const path        = `public/${id}.webp`
  const url         = `${supabaseUrl}/storage/v1/object/boarda-files/${path}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'image/webp',
      'x-upsert': 'false',
      'Cache-Control': '3600',
    },
    body: webpBlob,
  })
  if (!res.ok) throw new Error(`이미지 업로드 실패 (${res.status})`)
  return `${supabaseUrl}/storage/v1/object/public/boarda-files/${path}`
}

export default function SmartEditor({ value = '', onChange, placeholder = '내용을 입력하세요...', minHeight = 160 }) {
  const editorRef   = useRef(null)
  const [uploading, setUploading] = useState(false)
  const skipSync    = useRef(false)   // 외부 value 변경 시 커서 보호

  /* 외부 value → DOM (초기 또는 외부에서 리셋할 때만) */
  useEffect(() => {
    const el = editorRef.current
    if (!el || skipSync.current) return
    if (el.innerHTML !== value) {
      el.innerHTML = value || ''
    }
  }, [value])

  const emit = useCallback(() => {
    skipSync.current = true
    onChange?.(editorRef.current?.innerHTML ?? '')
    setTimeout(() => { skipSync.current = false }, 0)
  }, [onChange])

  /* execCommand 래퍼 */
  const cmd = (command, val = null) => (e) => {
    e.preventDefault()
    editorRef.current?.focus()
    document.execCommand(command, false, val)
    emit()
  }

  /* 링크 삽입 */
  const insertLink = (e) => {
    e.preventDefault()
    editorRef.current?.focus()
    const sel  = window.getSelection()
    const text = sel?.toString() || ''
    const url  = prompt('링크 URL을 입력하세요:', 'https://')
    if (!url) return
    const html = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text || url}</a>`
    document.execCommand('insertHTML', false, html)
    emit()
  }

  /* 인라인 이미지 — 파일 선택 */
  const imgInputRef = useRef(null)
  const insertImageFromFile = async (file) => {
    if (!file?.type.startsWith('image/')) return
    setUploading(true)
    try {
      const publicUrl = await uploadInlineImage(file)
      editorRef.current?.focus()
      document.execCommand('insertHTML', false,
        `<img src="${publicUrl}" alt="이미지" style="max-width:100%;border-radius:6px;margin:4px 0;" />`)
      emit()
    } catch (err) {
      alert('이미지 업로드 실패: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  /* 클립보드 붙여넣기 — 이미지 처리 */
  const handlePaste = async (e) => {
    const items = Array.from(e.clipboardData?.items ?? [])
    const imgItem = items.find((i) => i.type.startsWith('image/'))
    if (imgItem) {
      e.preventDefault()
      await insertImageFromFile(imgItem.getAsFile())
      return
    }
    /* 텍스트 붙여넣기 — 순수 텍스트만 (html strip) */
    const html  = e.clipboardData.getData('text/html')
    const text  = e.clipboardData.getData('text/plain')
    if (html) {
      e.preventDefault()
      document.execCommand('insertHTML', false, text.replace(/\n/g, '<br>'))
      emit()
    }
  }

  const handleInput = () => emit()

  const showPlaceholder = !value || value === '<br>' || value === ''

  return (
    <div style={{ border: '1.5px solid var(--c-border)', borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--c-bg)' }}>
      {/* 툴바 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3, padding: '6px 8px',
        borderBottom: '1px solid var(--c-border)', background: 'var(--c-surface)', flexWrap: 'wrap',
      }}>
        <BTN title="굵게 (Ctrl+B)"     icon="B"  onMouseDown={cmd('bold')} />
        <BTN title="기울임 (Ctrl+I)"   icon="I"  onMouseDown={cmd('italic')} />
        <BTN title="밑줄 (Ctrl+U)"     icon="U"  onMouseDown={cmd('underline')} />
        <BTN title="취소선"            icon="S"  onMouseDown={cmd('strikeThrough')} />
        <SEP />
        <BTN title="제목"              icon="H"  onMouseDown={cmd('formatBlock', 'H3')} />
        <SEP />
        <BTN title="글머리 기호"        icon="•≡" onMouseDown={cmd('insertUnorderedList')} />
        <BTN title="번호 목록"          icon="1≡" onMouseDown={cmd('insertOrderedList')} />
        <SEP />
        <BTN title="링크 삽입"          icon="🔗" onMouseDown={insertLink} />
        <BTN title="인라인 이미지 삽입" icon={uploading ? '⏳' : '🖼'} onMouseDown={(e) => { e.preventDefault(); imgInputRef.current?.click() }} />
        <SEP />
        <BTN title="서식 지우기"        icon="T̲×" onMouseDown={cmd('removeFormat')} />
        <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) insertImageFromFile(f); e.target.value = '' }} />
      </div>

      {/* 에디터 영역 */}
      <div style={{ position: 'relative' }}>
        {showPlaceholder && (
          <div style={{
            position: 'absolute', top: 10, left: 12,
            color: 'var(--c-muted)', fontSize: 13, pointerEvents: 'none', userSelect: 'none',
          }}>{placeholder}</div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          style={{
            minHeight, padding: '10px 12px',
            outline: 'none', fontSize: 13, lineHeight: 1.7,
            color: 'var(--c-text)',
            wordBreak: 'break-word', overflowWrap: 'break-word',
          }}
        />
      </div>
    </div>
  )
}
