import { useEffect, useRef } from "react";
import "./FinalCtaSection.css";

export default function FinalCtaSection() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const isOnFinalRef = useRef(false);
    const triggeredRef = useRef(false);

    const handleGoTop = () => {
        const el = document.getElementById("hero");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        const io = new IntersectionObserver(
            ([entry]) => {
                isOnFinalRef.current = entry.isIntersecting && entry.intersectionRatio > 0.8;
                // 마지막 섹션에 다시 들어오면 다시 동작 가능하게 리셋
                if (isOnFinalRef.current) triggeredRef.current = false;
            },
            { threshold: [0, 0.3, 0.6, 0.8, 1] }
        );

        if (sectionRef.current) io.observe(sectionRef.current);

        const onWheel = (e: WheelEvent) => {
            if (!isOnFinalRef.current) return;
            if (triggeredRef.current) return;
            if (e.deltaY <= 0) return;

            triggeredRef.current = true;
            handleGoTop();
        };

        // ✅ window가 아니라 document로 받으면 스냅/컨테이너 환경에서도 더 잘 잡힘
        document.addEventListener("wheel", onWheel, { passive: true });

        return () => {
            io.disconnect();
            document.removeEventListener("wheel", onWheel);
        };
    }, []);

    return (
        <section ref={sectionRef} className="finalHero snapSection" id="final-hero">
            <div className="finalHeroCenter">
                <button className="finalHeroBtn" onClick={handleGoTop}>
                    런부 다운로드 받기
                </button>
            </div>
        </section>
    );
}
