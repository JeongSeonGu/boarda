/**
 * components/modals/BoardSettingsModal.jsx
 * 수정:
 *  - 배경 컬러: 팔레트 + 직접 입력(color picker)
 *  - 배경 이미지: 프리셋 + 직접 업로드 (1024×768 리사이즈)
 *  - 배경 투명도 슬라이더
 *  - 반응 타입 설정
 */
import React, { useState, useEffect, useRef } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import useBoardStore from '../../store/useBoardStore'
import { supabase } from '../../utils/supabase'
import { genId } from '../../utils/helpers'
import { resizeImage, isImageFile } from '../../utils/imageUtils'
import '../../styles/boardSettings.css'

const PRESET_COLORS = [
  '#F7F8FC','#FFF9F0','#F0F7FF','#F0FFF4',
  '#FFF0F6','#F5F0FF','#FFFBF0','#1A1B2E',
  '#FFE8E8','#E8FFE8','#E8E8FF','#FFF8E8',
]

const PRESET_IMAGES = [
  { id: 'none',   label: '없음',   value: null,    preview: '⬜' },
  { id: 'dots',   label: '점선',   value: 'dots',  preview: '··' },
  { id: 'grid',   label: '격자',   value: 'grid',  preview: '⊞' },
  { id: 'wave',   label: '물결',   value: 'wave',  preview: '〰' },
  { id: 'cherry', label: '벚꽃',   value: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1200&q=80', preview: '🌸' },
  { id: 'forest', label: '숲',     value: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80', preview: '🌲' },
  { id: 'ocean',  label: '바다',   value: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&q=80', preview: '🌊' },
  { id: 'sky',    label: '하늘',   value: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', preview: '☁️' },
]

const REACTION_TYPES = [
  { value: 'none', icon: '🚫', label: '없음' },
  { value: 'like', icon: '👍', label: '좋아요' },
  { value: 'star', icon: '⭐', label: '별점' },
]

export default function BoardSettingsModal({ isOpen, onClose, board }) {
  const updateBoard = useBoardStore((s) => s.updateBoard)
  const showToast   = useBoardStore((s) => s.showToast)

  const [name,          setName]          = useState('')
  const [desc,          setDesc]          = useState('')
  const [bgColor,       setBgColor]       = useState('#F7F8FC')
  const [bgImage,       setBgImage]       = useState(null)
  const [bgImageKey,    setBgImageKey]    = useState(null)   // Storage 경로
  const [bgOpacity,     setBgOpacity]     = useState(1.0)
  const [reactionType,  setReactionType]  = useState('none')
  const [uploading,     setUploading]     = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (board && isOpen) {
      setName(board.name ?? '')
      setDesc(board.desc ?? board.description ?? '')
      setBgColor(board.bg_color ?? '#F7F8FC')
      setBgImage(board.bg_image ?? null)
      setBgImageKey(board.bg_image_key ?? null)
      setBgOpacity(board.bg_opacity ?? 1.0)
      setReactionType(board.reaction_type ?? 'none')
    }
  }, [board, isOpen])

  if (!board) return null

  /* 배경 이미지 업로드 (리사이즈 → Supabase Storage) */
  const handleImageUpload = async (file) => {
    if (!file || !isImageFile(file)) { showToast('이미지 파일만 업로드 가능합니다', 'error'); return }
    setUploading(true)
    try {
      /* 1024×768 리사이즈 */
      const resized = await resizeImage(file, 1024, 768)
      const ext     = 'jpg'
      const path    = `bg/${genId('bg')}.${ext}`

      /* 기존 배경이미지 삭제 */
      if (bgImageKey) {
        await supabase.storage.from('boarda-files').remove([bgImageKey])
      }

      /* 업로드 */
      const { error } = await supabase.storage
        .from('boarda-files')
        .upload(path, resized, { contentType: 'image/jpeg', cacheControl: '3600', upsert: false })

      if (error) { showToast('업로드 실패: ' + error.message, 'error'); return }

      const { data } = supabase.storage.from('boarda-files').getPublicUrl(path)
      setBgImage(data.publicUrl)
      setBgImageKey(path)
      showToast('배경 이미지가 업로드되었습니다', 'success')
    } catch (e) {
      showToast('이미지 처리 실패: ' + e.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  /* 배경 이미지 제거 */
  const handleRemoveBgImage = () => {
    setBgImage(null)
    setBgImageKey(null)
  }

  /* 저장 */
  const handleSave = async () => {
    if (!name.trim()) { showToast('보드 이름을 입력해주세요', 'error'); return }
    await updateBoard(board.id, {
      name:          name.trim(),
      description:   desc,
      bg_color:      bgColor,
      bg_image:      bgImage,
      bg_image_key:  bgImageKey,
      bg_opacity:    bgOpacity,
      reaction_type: reactionType,
    })
    onClose()
  }

  /* 배경 미리보기 스타일 */
  const isUrlImage = bgImage && !['dots','grid','wave'].includes(bgImage)
  const previewStyle = isUrlImage
    ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover',
        backgroundPosition: 'center', opacity: bgOpacity }
    : { background: bgColor }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚙️ 보드 설정" size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button variant="primary" onClick={handleSave}>저장</Button>
        </>
      }
    >
      {/* ── 기본 정보 ── */}
      <div className="settings-section">
        <div className="settings-section-title">기본 정보</div>
        <div className="form-group">
          <label className="form-label">보드 제목 *</label>
          <input className="form-input" value={name}
            onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">보드 설명</label>
          <textarea className="form-textarea" value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="이 보드에 대한 설명..." style={{ minHeight: 60 }} />
        </div>
      </div>

      {/* ── 배경 설정 ── */}
      <div className="settings-section">
        <div className="settings-section-title">배경</div>

        {/* 미리보기 */}
        <div style={{
          height: 80, borderRadius: 'var(--r-md)', marginBottom: 14,
          border: '1.5px solid var(--c-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: 0, ...previewStyle }} />
          <span style={{ position: 'relative', fontSize: 13, color: 'rgba(0,0,0,.5)',
            fontWeight: 600, textShadow: '0 1px 2px rgba(255,255,255,.7)' }}>
            미리보기
          </span>
        </div>

        {/* 배경색 — 프리셋 팔레트 + 직접 입력 */}
        <label className="form-label">배경 색상</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6, alignItems: 'center' }}>
          {PRESET_COLORS.map((c) => (
            <div key={c}
              className={`bg-swatch ${bgColor === c ? 'selected' : ''}`}
              style={{ background: c, border: `2.5px solid ${bgColor === c ? '#333' : 'rgba(0,0,0,.12)'}` }}
              title={c}
              onClick={() => setBgColor(c)}
            />
          ))}
          {/* 직접 색상 선택 */}
          <label title="직접 색상 선택" style={{
            width: 36, height: 36, borderRadius: 'var(--r-sm)',
            border: '2.5px dashed var(--c-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden', position: 'relative',
          }}>
            <span style={{ fontSize: 18, zIndex: 1 }}>🎨</span>
            <input type="color" value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
          </label>
          <span style={{ fontSize: 12, color: 'var(--c-muted)' }}>{bgColor}</span>
        </div>

        {/* 배경 이미지 — 프리셋 */}
        <label className="form-label" style={{ marginTop: 8 }}>배경 이미지</label>
        <div className="bg-image-grid" style={{ marginBottom: 10 }}>
          {PRESET_IMAGES.map((img) => (
            <div key={img.id}
              className={`bg-image-thumb ${bgImage === img.value ? 'selected' : ''}`}
              title={img.label}
              onClick={() => { setBgImage(img.value); if (img.value === null) setBgImageKey(null) }}
              style={img.value && !['dots','grid','wave'].includes(img.value)
                ? { backgroundImage: `url(${img.value})` }
                : { background: 'var(--c-bg)' }}
            >
              {(!img.value || ['dots','grid','wave'].includes(img.value)) && (
                <span style={{ fontSize: 20 }}>{img.preview}</span>
              )}
            </div>
          ))}
        </div>

        {/* 직접 업로드 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <input ref={fileInputRef} type="file" accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = '' }} />
          <button type="button" className="btn btn-secondary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}>
            {uploading ? '⏳ 업로드 중...' : '📁 이미지 직접 업로드'}
          </button>
          <span style={{ fontSize: 11, color: 'var(--c-muted)' }}>1024×768 이하로 자동 변환</span>
          {bgImageKey && (
            <button type="button" className="btn btn-danger btn-sm" onClick={handleRemoveBgImage}>
              ✕ 제거
            </button>
          )}
        </div>

        {/* 투명도 — 이미지 배경일 때만 */}
        {bgImage && !['dots','grid','wave'].includes(bgImage) && (
          <div>
            <label className="form-label">
              배경 투명도 &nbsp;
              <span style={{ fontWeight: 400, color: 'var(--c-muted)' }}>
                {Math.round(bgOpacity * 100)}%
              </span>
            </label>
            <input type="range" min={0.1} max={1} step={0.05}
              value={bgOpacity}
              onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--c-primary)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--c-muted)', marginTop: 2 }}>
              <span>흐리게</span><span>선명하게</span>
            </div>
          </div>
        )}
      </div>

      {/* ── 반응 설정 ── */}
      <div className="settings-section" style={{ paddingBottom: 0 }}>
        <div className="settings-section-title">게시물 반응</div>
        <div className="reaction-type-row">
          {REACTION_TYPES.map((r) => (
            <button key={r.value} type="button"
              className={`reaction-type-btn ${reactionType === r.value ? 'active' : ''}`}
              onClick={() => setReactionType(r.value)}>
              <span className="reaction-type-icon">{r.icon}</span>
              {r.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--c-muted)', marginTop: 8 }}>
          {reactionType === 'none' && '반응 기능을 사용하지 않습니다.'}
          {reactionType === 'like' && '게시물마다 👍 좋아요를 남길 수 있습니다.'}
          {reactionType === 'star' && '게시물마다 ⭐ 별점(1~5점)을 남길 수 있습니다.'}
        </p>
      </div>
    </Modal>
  )
}
