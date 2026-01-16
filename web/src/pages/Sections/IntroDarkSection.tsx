import "./IntroDarkSection.css";

export default function IntroDarkSection() {
    return (
        <section className="darkIntro snapSection" id="service-intro-dark">
            <div className="darkIntroInner">
                {/* 좌측: 카피 */}
                <div className="darkIntroLeft">
                    <p className="darkCopy">
                        밤에는
                        <br />
                        <span className="darkCopyStrong">다크 모드</span>로 눈부심 최소화
                    </p>
                </div>

                {/* 가운데: 이미지 */}
                <div className="darkIntroCenter">
                    <img className="darkPhone" src="/phone4.png" alt="RunBoo 다크 모드 화면" />
                </div>

                {/* 우측 상단 라벨 */}
                <div className="darkIntroRight" aria-hidden="true">
                    <div className="darkLabelWrap">
                        <span className="darkLabelText">다운로드</span>
                        <span className="darkLabelLine" />
                    </div>
                </div>
            </div>
        </section>
    );
}
