import { useState } from "react";
import "./NoticePage.css";

// 공지사항 데이터 타입 정의
interface NoticeData {
    id: number;
    title: string;
    date: string;
}

// 임시 더미 데이터 (스크린샷 내용 반영)
const MOCK_NOTICES: NoticeData[] = [
    { id: 1, title: "1.1 김동건 최고, 블랙이 흑인같노 너무 까맣다", date: "2026.01.15" },
    { id: 2, title: "1.2 김희곤 교통사고", date: "2026.01.15" },
    { id: 3, title: "1.1 김동건 최고", date: "2026.01.15" },
    { id: 4, title: "1.1 김동건 최고", date: "2026.01.15" },
    { id: 5, title: "서비스 점검 안내 (02:00 ~ 04:00)", date: "2026.01.14" },
    { id: 6, title: "개인정보 처리방침 변경 안내", date: "2026.01.10" },
];

export default function NoticePage() {
    const [page, setPage] = useState(1);

    return (
        <section className="noticePage">
            <div className="noticeInner">
                <h1 className="noticeTitle">공지사항</h1>

                <div className="noticeList">
                    {MOCK_NOTICES.map((item) => (
                        <div key={item.id} className="noticeItem">
                            <h3 className="noticeItemTitle">{item.title}</h3>
                            <p className="noticeItemDate">{item.date}</p>
                        </div>
                    ))}
                </div>

                {/* 페이지네이션 (디자인용 껍데기) */}
                <div className="pagination">
                    <button className="pageBtn" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        &lt;
                    </button>

                    <button className={`pageBtn ${page === 1 ? "active" : ""}`} onClick={() => setPage(1)}>1</button>
                    <button className={`pageBtn ${page === 2 ? "active" : ""}`} onClick={() => setPage(2)}>2</button>
                    <button className={`pageBtn ${page === 3 ? "active" : ""}`} onClick={() => setPage(3)}>3</button>
                    <button className={`pageBtn ${page === 4 ? "active" : ""}`} onClick={() => setPage(4)}>4</button>
                    <span>...</span>
                    <button className="pageBtn">100</button>

                    <button className="pageBtn" onClick={() => setPage(page + 1)}>
                        &gt;
                    </button>
                </div>
            </div>
        </section>
    );
}