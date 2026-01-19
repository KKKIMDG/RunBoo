import "./HomePage.css";
import IntroSection1 from "../Sections/IntroSection1";
import IntroLightSection from "../Sections/IntroLightSection";
import IntroDarkSection from "../Sections/IntroDarkSection";
import IntroStatsSection from "../Sections/IntroStatsSection";
import IntroAiSection from "../Sections/IntroAiSection";
import IntroNearbyGhostSection from "@/pages/Sections/IntroNearbyGhostSection.tsx";
import FinalCtaSection from "@/pages/Sections/FinalCtaSection.tsx";
import ScrollNavigator from "@/components/common/scrollNavigator/ScrollNavigator.tsx";
import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-visible");
          } else {
            entry.target.classList.remove("section-visible");
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "-50px",
      },
    );

    const sections = document.querySelectorAll(".animate-section");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <main className="homeScroll">
      <ScrollNavigator />
      {/* ===== Hero / 다운로드 ===== */}
      <section
        className="hero snapSection"
        id="top"
        data-title="다운로드"
        data-index="0 "
      >
        <div className="heroOverlay" />

        <div className="heroInner">
          <h1 className="heroTitle">
            과거의 나,
            <br />
            그리고 다른 러너와 함께
          </h1>

          <div className="heroCtas">
            <a className="storeBtn" href="#" aria-label="App Store">
              <img src="/appleLogo.png" alt="runboo" className="storeIcon" />
              <span className="storeText">App Store</span>
            </a>

            <a className="storeBtn" href="#" aria-label="Google Play">
              <img
                src="/googlePlayLogo.png"
                alt="runboo"
                className="playIcon"
              />
              <span className="storeText">Google Play</span>
            </a>
          </div>
        </div>
      </section>

      <section id="service" data-title="서비스 소개" data-index="1">
        <IntroSection1 />
        <IntroLightSection />
        <IntroDarkSection />
        <IntroStatsSection />
        <IntroAiSection />
        <IntroNearbyGhostSection />
        <FinalCtaSection />
      </section>
    </main>
  );
}
