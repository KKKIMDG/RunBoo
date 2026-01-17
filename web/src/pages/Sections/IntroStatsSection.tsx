import "./IntroStatsSection.css";

export default function IntroStatsSection() {
  return (
    <section className="statsIntro snapSection" id="service-intro-stats">
      <div className="statsIntroInner">
        {/* 좌측 문구 */}
        <div className="statsLeft animate-section">
          <p className="statsLeftText">단순한 러닝 기록을 넘어</p>
        </div>

        {/* 가운데 폰 */}
        <div className="statsCenter animate-section">
          <img
            className="statsPhone"
            src="/phone5.png"
            alt="RunBoo 통계 화면"
          />
        </div>

        {/* 우측 문구 + 라벨 */}
        <div className="statsRight animate-section">
          <p className="statsRightText">
            주간과 월간 기록의
            <br />
            완벽한 <span className="statsStrong">시각화</span>
          </p>
        </div>
      </div>
    </section>
  );
}
