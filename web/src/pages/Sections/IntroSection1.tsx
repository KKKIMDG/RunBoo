import "./IntroSection1.css";

type Props = {
    // 네가 나중에 실제 이미지 경로로 교체하면 됨
    phone1Src?: string;
    phone2Src?: string;
    phone3Src?: string;
};

export default function IntroSection1({
                                          phone1Src = "/public/phone1.png",
                                          phone2Src = "/public/phone2.png",
                                          phone3Src = "/public/phone3.png",
                                      }: Props) {
    return (
        <section className="intro1 snapSection" id="service-intro-1">
            <div className="intro1Inner">
                {/* 왼쪽: 휴대폰 3장 스택 */}
                <div className="intro1Left" aria-label="RunBoo 앱 화면 미리보기">
                    <div className="phoneStack">
                        <img className="phone phoneBack" src={phone1Src} alt="" />
                        <img className="phone phoneMid" src={phone2Src} alt="" />
                        <img className="phone phoneFront" src={phone3Src} alt="" />
                    </div>
                </div>

                {/* 오른쪽: 문구 */}
                <div className="intro1Right">
                    <p className="intro1Line">
                        <span className="intro1Strong">일반 러닝 측정</span>에 더해
                    </p>
                    <p className="intro1Line">
                        <span className="intro1Strong">티어 측정</span>을 통해 나의 러닝을 뽐내고
                    </p>
                    <p className="intro1Line">
                        <span className="intro1Strong">고스트 모드</span>를 통해 과거의 나,
                        그리고 다른 이들과의 대결
                    </p>
                </div>
            </div>
        </section>
    );
}
