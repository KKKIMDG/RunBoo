import "./FinalCtaSection.css";

export default function FinalCtaSection() {
    const handleGoTop = () => {
        const el = document.getElementById("hero");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <section className="finalHero snapSection" id="final-hero">
            <div className="finalHeroCenter">
                <h1 className="finalHeroTitle">
                    이 모든 걸 <span>단 하나의 앱</span>으로
                </h1>

                <button className="finalHeroBtn" onClick={handleGoTop}>
                    런부 다운로드 받기
                </button>
            </div>
        </section>
    );
}
