// hooks/useFetch.ts
// - 데이터 fetching 훅: URL을 받아 JSON을 가져오고 로딩 상태를 제공합니다.
// - 개선: 에러 처리, 리트라이, 취소(AbortController) 추가 권장.
import { useEffect, useState } from 'react';

export function useFetch<T = any>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [url]);
  return { data, loading };
}
