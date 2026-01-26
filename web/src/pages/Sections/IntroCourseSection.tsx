import "./IntroCourseSection.css";

export default function IntroCourseSection() {
  return (
    <section className="lightIntro snapSection" id="service-intro-light">
      <div className="lightIntroInner">
        {/* 좌측: 이미지 */}
        <div className="lightIntroLeft">
          <img
            className="lightPhone animate-section"
            src="/phone12.png"
            alt="RunBoo 라이트 모드 화면"
          />
        </div>

        {/* 우측: 텍스트 + 라벨 */}
        <div className="lightIntroRight animate-section">
          <p className="lightCopy">
            나만의 러닝 코스가
            <br />
            <span className="lightCopyStrong">인기 코스가 될 수 있다.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
