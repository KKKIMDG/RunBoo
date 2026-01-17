import "./IntroDarkSection.css";

export default function IntroDarkSection() {
  return (
    <section className="darkIntro snapSection" id="service-intro-dark">
      <div className="darkIntroInner">
        {/* 좌측: 카피 */}
        <div className="darkIntroLeft animate-section">
          <p className="darkCopy">
            밤에는
            <br />
            <span className="darkCopyStrong">다크 모드</span>로 눈부심 최소화
          </p>
        </div>

        {/* 가운데: 이미지 */}
        <div className="darkIntroCenter">
          <img
            className="darkPhone animate-section"
            src="/phone4.png"
            alt="RunBoo 다크 모드 화면"
          />
        </div>
      </div>
    </section>
  );
}
