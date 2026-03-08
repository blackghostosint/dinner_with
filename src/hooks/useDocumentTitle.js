import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Dinner with...` : 'Dinner with...';
    return () => {
      document.title = 'Dinner with...';
    };
  }, [title]);
}
