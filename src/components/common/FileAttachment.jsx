/**
 * components/common/FileAttachment.jsx
 * 파일 업로드 + 첨부파일 목록 표시 공통 컴포넌트
 * - isOwner=true  → 업로드/삭제 가능
 * - isOwner=false → 다운로드만 가능
 */
import React, { useRef, useState } from 'react'
import useBoardStore from '../../store/useBoardStore'
import { formatFileSize } from '../../utils/helpers'

function fileIcon(type = '') {
  if (type.startsWith('image/')) return '🖼️'
  if (type.startsWith('video/')) return '🎬'
  if (type.startsWith('audio/')) return '🎵'
  if (type.includes('pdf'))      return '📄'
  if (type.includes('zip') || type.includes('compressed')) return '🗜️'
  return '📎'
}

export default function FileAttachment({ attachments = [], onChange, isOwner = true }) {
  const uploadFile = useBoardStore((s) => s.uploadFile)
  const showToast  = useBoardStore((s) => s.showToast)
  const inputRef   = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (files) => {
    const arr = Array.from(files)
    if (!arr.length) return
    setUploading(true)
    const results = []
    for (const f of arr) {
      if (f.size > 50 * 1024 * 1024) {
        showToast(`${f.name}: 50MB 초과 파일은 업로드할 수 없습니다`, 'error')
        continue
      }
      const result = await uploadFile(f)
      if (result) results.push(result)
    }
    setUploading(false)
    if (results.length) onChange?.([...attachments, ...results])
  }

  const handleRemove = (idx) => {
    const next = attachments.filter((_, i) => i !== idx)
    onChange?.(next)
  }

  return (
    <div>
      {/* 업로드 영역 (작성자만) */}
      {isOwner && (
        <div>
          <input
            ref={inputRef}
            type="file"
            multiple
            style={{ display:'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{ marginBottom: attachments.length ? 10 : 0 }}
          >
            {uploading ? '⏳ 업로드 중...' : '📎 파일 첨부'}
          </button>
          <span style={{ fontSize:11, color:'var(--c-muted)', marginLeft:8 }}>
            이미지, 영상, 문서 등 (최대 50MB)
          </span>
        </div>
      )}

      {/* 첨부파일 목록 */}
      {attachments.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
          {attachments.map((f, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:8,
              background:'var(--c-bg)', border:'1px solid var(--c-border)',
              borderRadius:'var(--r-sm)', padding:'7px 10px',
            }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{fileIcon(f.type)}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--c-text)',
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {f.name}
                </div>
                {f.size && (
                  <div style={{ fontSize:10, color:'var(--c-muted)' }}>
                    {formatFileSize(f.size)}
                  </div>
                )}
              </div>

              {/* 이미지 미리보기 */}
              {f.type?.startsWith('image/') && (
                <img src={f.url} alt={f.name}
                  style={{ width:40, height:40, objectFit:'cover', borderRadius:6, flexShrink:0 }} />
              )}

              {/* 다운로드 버튼 */}
              <a href={f.url} download={f.name} target="_blank" rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{ textDecoration:'none', flexShrink:0 }}>
                ⬇️
              </a>

              {/* 삭제 (작성자만) */}
              {isOwner && (
                <button
                  className="action-icon danger"
                  onClick={() => handleRemove(i)}
                  title="첨부파일 제거"
                  style={{ flexShrink:0, border:'none' }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
