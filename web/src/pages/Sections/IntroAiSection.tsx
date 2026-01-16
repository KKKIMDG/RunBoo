import "./IntroAiSection.css";

export default function IntroAiSection() {
    return (
        <section className="aiIntro snapSection" id="service-intro-ai">
            <div className="aiIntroInner">
                {/* 좌측 문구 (두 줄 구성) */}
                <div className="aiLeft">
                    <p className="aiLineTop">여기에</p>
                    <p className="aiLineBottom">
                        <span className="aiStrong">AI 분석 리포트</span>까지
                    </p>
                </div>

                {/* 가운데 폰 */}
                <div className="aiCenter">
                    <img className="aiPhone" src="/phone6.png" alt="RunBoo AI 분석 리포트 화면" />
                </div>

                {/* 우측 라벨(상단) */}
                <div className="aiRight" aria-hidden="true">
                    <div className="aiLabelWrap">
                        <span className="aiLabelText">다운로드</span>
                        <span className="aiLabelLine" />
                    </div>
                </div>
            </div>
        </section>
    );
}
