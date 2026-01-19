import "./IntroAiSection.css";

export default function IntroAiSection() {
  return (
    <section className="aiIntro snapSection" id="service-intro-ai">
      <div className="aiIntroInner">
        {/* 좌측 문구 (두 줄 구성) */}
        <div className="aiLeft animate-section">
          <p className="aiLineTop">더욱 잘 뛰고 싶은 당신을 위해</p>
          <p className="aiLineBottom">
            <span className="aiStrong">AI 분석 리포트</span>까지
          </p>
        </div>

        {/* 가운데 폰 */}
        <div className="aiCenter animate-section">
          <img
            className="aiPhone"
            src="/phone6.png"
            alt="RunBoo AI 분석 리포트 화면"
          />
        </div>
      </div>
    </section>
  );
}
