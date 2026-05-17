/**
 * hooks/useModal.js
 * 모달 열기/닫기 상태를 관리하는 커스텀 훅
 */
import { useState, useCallback } from 'react';

/**
 * @param {boolean} [initial=false]
 * @returns {{ isOpen: boolean, open: (data?:any)=>void, close: ()=>void, data: any }}
 */
export function useModal(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const [data, setData] = useState(null);

  const open = useCallback((payload = null) => {
    setData(payload);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  return { isOpen, open, close, data };
}
