
import "./HomePage.css";

export default function HomePage() {
    return (
        <section className="hero" id="top">
            {/* 배경 위에 깔리는 어두운 그라데이션 + 하단 페이드 */}
            <div className="heroOverlay" />

            <div className="heroInner">
                <h1 className="heroTitle">
                    과거의 나,
                    <br />
                    그리고 다른 러너와 함께
                </h1>

                <div className="heroCtas">
                    <a className="storeBtn" href="#" aria-label="App Store">
                        <span className="storeIcon"></span>
                        <span className="storeText">App Store</span>
                    </a>

                    <a className="storeBtn" href="#" aria-label="Google Play">
                        <span className="playIcon" />
                        <span className="storeText">Google Play</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
