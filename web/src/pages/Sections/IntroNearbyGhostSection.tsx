import "./IntroNearbyGhostSection.css";

type Props = {
    phoneSrc?: string;
};

export default function IntroNearbyGhostSection({
                                                    phoneSrc = "/phone7.png",
                                                }: Props) {
    return (
        <section
            className="nearbyIntro snapSection"
            id="service-intro-nearby-ghost"
        >
            <div className="nearbyIntroInner">
                {/* 좌측 문구 */}
                <div className="nearbyLeft animate-section">
                    <p className="nearbyLineTop">내 위치 주변의</p>
                    <p className="nearbyLineBottom">
                        <span className="nearbyStrong">러너</span>를 찾아주고
                    </p>
                </div>

                {/* 가운데 폰 */}
                <div className="nearbyCenter animate-section">
                    <img
                        className="nearbyPhone"
                        src={phoneSrc}
                        alt="RunBoo 주변 러너 및 고스트 화면"
                    />
                </div>

                {/* 우측 문구 */}
                <div className="nearbyRight animate-section">
                    <p className="nearbyRightText">
                        러닝 기록을 불러와
                        <br />
                        함께 뛰어보기
                    </p>
                </div>
            </div>
        </section>
    );
}
