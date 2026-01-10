// frontend/src/hooks/useCadence.ts

import { useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import { Pedometer } from "expo-sensors";

/** expo pedometer 기반으로 케이던스(spm)를 계산하게 구현하였습니다.
 *  이곳에서 구현하고,
 *  일반 런닝 페이지, 티어, 고스트에서는 불러다가만 사용하게 구현.
 * */

type Options = {
    enabled: boolean; // 러닝 중일 때만 true
    windowSec?: number; // 최근 N초 윈도우
    emaAlpha?: number; // 0~1 (클수록 빠르게 반응)
};

type StepSample = { t: number; steps: number };

export function useCadence({ enabled, windowSec = 5, emaAlpha = 0.35 } : Options) {
    const [cadence, setCadence] = useState(0);

    const sampleRef = useRef<StepSample[]>([]);
    const emaRef = useRef<number>(0);

    useEffect(() => {
        let sub: { remove: () => void } | null = null;
        let mounted = true;

        const reset = () => {
            sampleRef.current = [];
            emaRef.current = 0;
            if (mounted) setCadence(0);
        };

        const start = async() => {
            if (!enabled) {
                reset();
                return;
            }

            const available = await Pedometer.isAvailableAsync();
            if(!available) {
                reset();
                return;
            }

            const req = (Pedometer as any).requestPermissionAsync;
            if (typeof req === "function") {
                const res = await req();
                if (res?.status !== "granted") {
                    reset();
                    return;
                }
            }

            sub = Pedometer.watchStepCount((result) => {
                const now = Date.now();
                const steps = result?.steps ?? 0;

                const arr = sampleRef.current;
                arr.push({ t:now, steps });

                const cutoff = now - windowSec * 1000;
                while (arr.length > 0 && arr[0].t < cutoff) arr.shift();

                if (arr.length >= 2) {
                    const first = arr[0];
                    const last = arr[arr.length - 1];
                    const deltaSteps = Math.max(0, last.steps - first.steps);
                    const instant = (deltaSteps / windowSec)* 60;

                    const prev = emaRef.current;
                    const next = prev === 0 ? instant : prev + emaAlpha * (instant - prev);
                    emaRef.current = next;

                    if (mounted) setCadence(Math.round(next));
                } else {
                    if (mounted) setCadence(0);
                }
            });
        };

        start();

        return () => {
            mounted = false;
            sub?.remove?.();
        };
    }, [enabled, windowSec, emaAlpha]);

    return useMemo(() => cadence, [cadence]);
}

