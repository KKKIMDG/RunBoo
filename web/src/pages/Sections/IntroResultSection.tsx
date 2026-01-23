import "./IntroResultSection.css";

export default function IntroResultSection() {
    return (
        <section className="resultIntro snapSection" id="service-intro-result">
            <div className="resultIntroInner">
                {/* 좌측 문구 */}
                <div className="resultLeft animate-section">
                    <p className="resultLeftTitle">가장 완벽한 결과 화면</p>
                </div>

                {/* 가운데 폰 */}
                <div className="resultCenter animate-section">
                    <img
                        className="resultPhone"
                        src="/phone11.png"
                        alt="RunBoo 러닝 결과 화면"
                    />
                </div>

                {/* 우측 문구 */}
                <div className="resultRight animate-section">
                    <p className="resultRightText">
                        정확한 거리, 시간, 페이스
                        <br />
                        그리고 평균 케이던스까지
                    </p>
                </div>
            </div>
        </section>
    );
}
