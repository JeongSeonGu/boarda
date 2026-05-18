/**
 * components/common/LinkifiedText.jsx
 * 텍스트 내 URL을 자동으로 클릭 가능한 링크로 렌더링
 */
import React from 'react'
import { parseLinks } from '../../utils/linkify'

export default function LinkifiedText({ text = '', style = {}, className = '' }) {
  const parts = parseLinks(text)

  return (
    <span style={style} className={className}>
      {parts.map((part, i) =>
        part.type === 'link' ? (
          <a
            key={i}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              color: 'var(--c-primary)',
              textDecoration: 'underline',
              wordBreak: 'break-all',
            }}
          >
            {part.value}
          </a>
        ) : (
          <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part.value}</span>
        )
      )}
    </span>
  )
}
