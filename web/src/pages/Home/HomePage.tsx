import "./HomePage.css";
import IntroSection1 from "../Sections/IntroSection1";
import IntroLightSection from "../Sections/IntroLightSection";
import IntroDarkSection from "../Sections/IntroDarkSection";


export default function HomePage() {
    return (
        <main className="homeScroll">
            {/* ===== Hero / 다운로드 ===== */}
            <section className="hero snapSection" id="top">
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

            <IntroSection1 />
            <IntroLightSection />
            <IntroDarkSection />
        </main>
    );
}
