/**
 * components/common/FileAttachment.jsx
 * 수정:
 *  - 파일별 업로드 진행률 표시 (XMLHttpRequest 기반)
 *  - 드래그앤드롭
 *  - 링크 URL 첨부 기능 추가
 *  - 개별 삭제
 *  - 이미지 미리보기
 */
import React, { useRef, useState, useCallback } from 'react'
import { supabase } from '../../utils/supabase'
import useBoardStore from '../../store/useBoardStore'
import { formatFileSize } from '../../utils/helpers'
import { isValidUrl } from '../../utils/linkify'

function fileIcon(type = '') {
  if (!type) return '📎'
  if (type.startsWith('image/')) return '🖼️'
  if (type.startsWith('video/')) return '🎬'
  if (type.startsWith('audio/')) return '🎵'
  if (type.includes('pdf'))      return '📄'
  if (type.includes('zip') || type.includes('compressed')) return '🗜️'
  if (type.includes('word') || type.includes('document'))  return '📝'
  if (type.includes('sheet') || type.includes('excel'))    return '📊'
  return '📎'
}

function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

/* 진행률 포함 업로드 (XMLHttpRequest) */
async function uploadWithProgress(file, onProgress) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const ext  = file.name.split('.').pop()
  const path = `public/${genId()}.${ext}`
  const url  = `${supabaseUrl}/storage/v1/object/boarda-files/${path}`

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('Authorization', `Bearer ${supabaseKey}`)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.setRequestHeader('Cache-Control', '3600')

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/boarda-files/${path}`
        resolve({ name: file.name, url: publicUrl, type: file.type, size: file.size })
      } else {
        let msg = `업로드 실패 (${xhr.status})`
        try {
          const body = JSON.parse(xhr.responseText)
          if (body?.error?.includes('row-level-security') || xhr.status === 403) {
            msg = 'Storage 권한 오류 — Supabase 버킷을 Public으로 설정하거나 Policy를 추가하세요'
          } else if (body?.message) {
            msg = body.message
          }
        } catch {}
        reject(new Error(msg))
      }
    }

    xhr.onerror = () => reject(new Error('네트워크 오류'))
    xhr.send(file)
  })
}

export default function FileAttachment({ attachments = [], onChange, isOwner = true }) {
  const showToast = useBoardStore((s) => s.showToast)
  const inputRef  = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [linkInput, setLinkInput]   = useState('')
  const [showLinkBox, setShowLinkBox] = useState(false)

  /* 개별 파일 업로드 진행 상태 { id, name, progress, done, error } */
  const [uploadQueue, setUploadQueue] = useState([])

  const updateItem = (id, patch) =>
    setUploadQueue((q) => q.map((item) => item.id === id ? { ...item, ...patch } : item))

  const processFiles = useCallback(async (files) => {
    const arr = Array.from(files).filter((f) => {
      if (f.size > 50 * 1024 * 1024) {
        showToast(`${f.name}: 50MB 초과`, 'error'); return false
      }
      return true
    })
    if (!arr.length) return

    const newItems = arr.map((f) => ({ id: genId(), name: f.name, progress: 0, done: false, error: null }))
    setUploadQueue((q) => [...q, ...newItems])

    const results = []
    for (let i = 0; i < arr.length; i++) {
      const f    = arr[i]
      const item = newItems[i]
      try {
        const result = await uploadWithProgress(f, (pct) => updateItem(item.id, { progress: pct }))
        updateItem(item.id, { progress: 100, done: true })
        results.push(result)
      } catch (err) {
        updateItem(item.id, { error: err.message, done: true })
        showToast(`${f.name}: ${err.message}`, 'error')
      }
    }

    /* 완료 항목 3초 후 큐에서 제거 */
    setTimeout(() => {
      setUploadQueue((q) => q.filter((item) => !item.done))
    }, 3000)

    if (results.length) onChange?.([...attachments, ...results])
  }, [attachments, onChange, showToast])

  /* 링크 URL 첨부 */
  const handleAddLink = () => {
    const url = linkInput.trim()
    if (!url) return
    if (!isValidUrl(url)) { showToast('올바른 URL을 입력해주세요 (http:// 또는 https://)', 'error'); return }
    onChange?.([...attachments, { name: url, url, type: 'link', size: 0 }])
    setLinkInput('')
    setShowLinkBox(false)
  }

  const handleRemove = (idx) => onChange?.(attachments.filter((_, i) => i !== idx))

  const onDragOver  = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = ()  => setDragOver(false)
  const onDrop      = (e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files) }

  return (
    <div>
      {isOwner && (
        <>
          {/* 드래그앤드롭 영역 */}
          <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            style={{
              border: `2px dashed ${dragOver ? 'var(--c-primary)' : 'var(--c-border)'}`,
              borderRadius: 'var(--r-md)',
              background: dragOver ? 'var(--c-primary-light)' : 'var(--c-bg)',
              padding: '12px 14px',
              transition: 'all var(--transition)',
              marginBottom: 8,
            }}>
            <input ref={inputRef} type="file" multiple style={{ display:'none' }}
              onChange={(e) => { processFiles(e.target.files); e.target.value = '' }} />
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <button type="button" className="btn btn-secondary btn-sm"
                onClick={() => inputRef.current?.click()}>
                📎 파일 선택
              </button>
              <button type="button" className="btn btn-outline btn-sm"
                onClick={() => setShowLinkBox((v) => !v)}>
                🔗 링크 추가
              </button>
              <span style={{ fontSize:11, color:'var(--c-muted)' }}>
                {dragOver ? '여기에 놓으세요!' : '또는 파일을 드래그 (최대 50MB)'}
              </span>
            </div>
          </div>

          {/* 링크 입력창 */}
          {showLinkBox && (
            <div style={{ display:'flex', gap:6, marginBottom:8 }}>
              <input
                className="form-input"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                style={{ flex:1 }}
                autoFocus
              />
              <button type="button" className="btn btn-primary btn-sm" onClick={handleAddLink}>추가</button>
              <button type="button" className="btn btn-secondary btn-sm"
                onClick={() => { setShowLinkBox(false); setLinkInput('') }}>취소</button>
            </div>
          )}

          {/* 업로드 진행 큐 */}
          {uploadQueue.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:8 }}>
              {uploadQueue.map((item) => (
                <div key={item.id} style={{
                  background: 'var(--c-surface)',
                  border: `1.5px solid ${item.error ? 'var(--c-danger)' : 'var(--c-border)'}`,
                  borderRadius: 'var(--r-sm)', padding:'8px 12px',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: item.done ? 0 : 6 }}>
                    <span style={{ fontSize:12, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {item.error ? '❌' : item.done ? '✅' : '⏳'} {item.name}
                    </span>
                    <span style={{ fontSize:11, fontWeight:700,
                      color: item.error ? 'var(--c-danger)' : item.done ? 'var(--c-accent)' : 'var(--c-primary)',
                      flexShrink:0 }}>
                      {item.error ? '실패' : item.done ? '완료' : `${item.progress}%`}
                    </span>
                  </div>
                  {!item.done && (
                    <div style={{ height:4, background:'var(--c-border)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{
                        height:'100%', borderRadius:2,
                        background:'var(--c-primary)',
                        width:`${item.progress}%`,
                        transition:'width .2s',
                      }} />
                    </div>
                  )}
                  {item.error && (
                    <div style={{ fontSize:11, color:'var(--c-danger)', marginTop:4 }}>{item.error}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 첨부파일 목록 */}
      {attachments.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {attachments.map((f, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:8,
              background:'var(--c-surface)', border:'1.5px solid var(--c-border)',
              borderRadius:'var(--r-sm)', padding:'8px 10px',
            }}>
              <span style={{ fontSize:18, flexShrink:0 }}>
                {f.type === 'link' ? '🔗' : fileIcon(f.type)}
              </span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--c-text)',
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {f.name}
                </div>
                {f.size > 0 && (
                  <div style={{ fontSize:10, color:'var(--c-muted)' }}>{formatFileSize(f.size)}</div>
                )}
              </div>

              {/* 이미지 미리보기 */}
              {f.type?.startsWith('image/') && f.url && (
                <img src={f.url} alt={f.name}
                  style={{ width:40, height:40, objectFit:'cover', borderRadius:6,
                    flexShrink:0, border:'1px solid var(--c-border)' }} />
              )}

              {/* 다운로드/열기 */}
              <a href={f.url}
                download={f.type !== 'link' ? f.name : undefined}
                target="_blank" rel="noopener noreferrer"
                title={f.type === 'link' ? '링크 열기' : '다운로드'}
                onClick={(e) => e.stopPropagation()}
                style={{
                  flexShrink:0, width:30, height:30,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  borderRadius:'var(--r-sm)', border:'1.5px solid var(--c-border)',
                  color:'var(--c-primary)', textDecoration:'none', fontSize:14,
                  background:'var(--c-primary-light)',
                }}>
                {f.type === 'link' ? '↗' : '⬇️'}
              </a>

              {/* 삭제 (작성자만) */}
              {isOwner && (
                <button type="button" onClick={() => handleRemove(i)} title="제거"
                  style={{
                    flexShrink:0, width:30, height:30,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    borderRadius:'var(--r-sm)', border:'1.5px solid var(--c-border-strong)',
                    background:'var(--c-danger-light)', color:'var(--c-danger)',
                    cursor:'pointer', fontSize:13, fontWeight:700,
                  }}>✕</button>
              )}
            </div>
          ))}
          <div style={{ fontSize:11, color:'var(--c-muted)', textAlign:'right' }}>
            총 {attachments.length}개 첨부
          </div>
        </div>
      )}
    </div>
  )
}
