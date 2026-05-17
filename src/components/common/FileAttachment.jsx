/**
 * components/common/FileAttachment.jsx
 * 수정:
 *  - 파일 드래그앤드롭 업로드 지원
 *  - 업로드 진행 개별 표시 (파일별 상태)
 *  - 첨부된 파일 개별 삭제 버튼 (✕) 명확히 표시
 *  - 이미지 미리보기 개선
 *  - isOwner=false → 다운로드 전용
 */
import React, { useRef, useState, useCallback } from 'react'
import useBoardStore from '../../store/useBoardStore'
import { formatFileSize } from '../../utils/helpers'

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

export default function FileAttachment({ attachments = [], onChange, isOwner = true }) {
  const uploadFile = useBoardStore((s) => s.uploadFile)
  const showToast  = useBoardStore((s) => s.showToast)
  const inputRef   = useRef(null)

  /* 업로드 중인 파일명 목록 */
  const [uploadingNames, setUploadingNames] = useState([])
  const [dragOver, setDragOver] = useState(false)

  /* 파일 업로드 처리 */
  const processFiles = useCallback(async (files) => {
    const arr = Array.from(files).filter((f) => {
      if (f.size > 50 * 1024 * 1024) {
        showToast(`${f.name}: 50MB 초과 파일은 업로드할 수 없습니다`, 'error')
        return false
      }
      return true
    })
    if (!arr.length) return

    setUploadingNames(arr.map((f) => f.name))
    const results = []
    for (const f of arr) {
      const result = await uploadFile(f)
      if (result) results.push(result)
      /* 완료된 파일은 목록에서 제거 */
      setUploadingNames((prev) => prev.filter((n) => n !== f.name))
    }
    if (results.length) onChange?.([...attachments, ...results])
  }, [attachments, onChange, uploadFile, showToast])

  /* 개별 파일 삭제 */
  const handleRemove = (idx) => {
    onChange?.(attachments.filter((_, i) => i !== idx))
  }

  /* 드래그앤드롭 핸들러 */
  const onDragOver  = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = ()  => setDragOver(false)
  const onDrop      = (e) => {
    e.preventDefault(); setDragOver(false)
    processFiles(e.dataTransfer.files)
  }

  const isUploading = uploadingNames.length > 0

  return (
    <div>
      {/* 업로드 영역 (작성자만) */}
      {isOwner && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${dragOver ? 'var(--c-primary)' : 'var(--c-border)'}`,
            borderRadius: 'var(--r-md)',
            background: dragOver ? 'var(--c-primary-light)' : 'var(--c-bg)',
            padding: '12px 16px',
            transition: 'all var(--transition)',
            marginBottom: attachments.length || isUploading ? 10 : 0,
          }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => { processFiles(e.target.files); e.target.value = '' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? '⏳ 업로드 중...' : '📎 파일 선택'}
            </button>
            <span style={{ fontSize: 12, color: 'var(--c-muted)' }}>
              {dragOver
                ? '여기에 놓으세요!'
                : '또는 파일을 여기로 드래그하세요 (최대 50MB)'}
            </span>
          </div>

          {/* 업로드 진행 중 파일 목록 */}
          {isUploading && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {uploadingNames.map((name) => (
                <div key={name} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, color: 'var(--c-primary)',
                }}>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                  <span>{name} 업로드 중...</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 첨부파일 목록 */}
      {attachments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {attachments.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--c-surface)',
              border: '1.5px solid var(--c-border)',
              borderRadius: 'var(--r-sm)', padding: '8px 10px',
            }}>
              {/* 아이콘 */}
              <span style={{ fontSize: 20, flexShrink: 0 }}>{fileIcon(f.type)}</span>

              {/* 파일 정보 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 600, color: 'var(--c-text)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {f.name}
                </div>
                {f.size > 0 && (
                  <div style={{ fontSize: 10, color: 'var(--c-muted)' }}>
                    {formatFileSize(f.size)}
                  </div>
                )}
              </div>

              {/* 이미지 미리보기 */}
              {f.type?.startsWith('image/') && f.url && (
                <img
                  src={f.url} alt={f.name}
                  style={{ width: 44, height: 44, objectFit: 'cover',
                    borderRadius: 6, flexShrink: 0, border: '1px solid var(--c-border)' }}
                />
              )}

              {/* 다운로드 */}
              <a
                href={f.url} download={f.name}
                target="_blank" rel="noopener noreferrer"
                title="다운로드"
                style={{
                  flexShrink: 0, width: 30, height: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 'var(--r-sm)', border: '1.5px solid var(--c-border)',
                  color: 'var(--c-primary)', textDecoration: 'none', fontSize: 14,
                  background: 'var(--c-primary-light)',
                }}
              >
                ⬇️
              </a>

              {/* 삭제 (작성자만) */}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  title="첨부파일 제거"
                  style={{
                    flexShrink: 0, width: 30, height: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 'var(--r-sm)', border: '1.5px solid var(--c-border-strong)',
                    background: 'var(--c-danger-light)', color: 'var(--c-danger)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {/* 총 첨부 수 표시 */}
          <div style={{ fontSize: 11, color: 'var(--c-muted)', textAlign: 'right' }}>
            총 {attachments.length}개 첨부됨
          </div>
        </div>
      )}
    </div>
  )
}
