import "./IntroFriendsSection.css";

export default function IntroFriendsSection() {
  return (
    <section className="darkIntro snapSection" id="service-intro-dark">
      <div className="darkIntroInner">
        {/* 좌측: 카피 */}
        <div className="darkIntroLeft animate-section">
          <p className="darkCopy">
            친구 추가 기능으로
            <br />
            <span className="darkCopyStrong">친구와 함께</span>
            <br />
            러닝이 더 즐거워진다.
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
