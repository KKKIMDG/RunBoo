import "./IntroLightSection.css";

export default function IntroLightSection() {
  return (
    <section className="lightIntro snapSection" id="service-intro-light">
      <div className="lightIntroInner">
        {/* 좌측: 이미지 */}
        <div className="lightIntroLeft">
          <img
            className="lightPhone animate-section"
            src="/phone1.png"
            alt="RunBoo 라이트 모드 화면"
          />
        </div>

        {/* 우측: 텍스트 + 라벨 */}
        <div className="lightIntroRight animate-section">
          <p className="lightCopy">
            평소에는 편안하게
            <br />
            <span className="lightCopyStrong">라이트 모드</span>를
          </p>
        </div>
      </div>
    </section>
  );
}
