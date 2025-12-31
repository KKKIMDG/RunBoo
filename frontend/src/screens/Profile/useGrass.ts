import { useEffect, useMemo, useState } from "react";
import { fetchGrass } from "@/services/record/recordsService";
import type { GrassResponseDto } from "@/types/record";

export function useGrass(weeks = 12) {
    const [data, setData] = useState<GrassResponseDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                const res = await fetchGrass(weeks);
                if (mounted) setData(res);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [weeks]);

    const levelMap = useMemo(() => {
        const m = new Map<string, 0 | 1 | 2>();
        (data?.days ?? []).forEach((d) => m.set(d.date, d.level));
        return m;
    }, [data]);

    return { data, levelMap, loading };
}
