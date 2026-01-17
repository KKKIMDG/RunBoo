import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { noticeApi } from "../../api/noticeApi";
import type { Notice } from "../../types/admin";
import "./NoticePage.css";

export default function NoticePage() {
  const [page, setPage] = useState(1);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await noticeApi.getAllNotices();
      // 최신 순으로 정렬
      const sortedData = [...data].sort((a, b) => {
        if (a.id && b.id) {
          return b.id - a.id;
        }
        return 0;
      });
      setNotices(sortedData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "공지사항을 불러오는데 실패했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeClick = (id?: number) => {
    if (id) {
      navigate(`/notice/${id}`);
    }
  };

  return (
    <section className="noticePage">
      <div className="noticeInner">
        <h1 className="noticeTitle">공지사항</h1>

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : notices.length === 0 ? (
          <div className="empty">등록된 공지사항이 없습니다.</div>
        ) : (
          <>
            <div className="noticeList">
              {notices.map((item) => (
                <div
                  key={item.id}
                  className="noticeItem"
                  onClick={() => handleNoticeClick(item.id)}
                >
                  <h3 className="noticeItemTitle">{item.title}</h3>
                  <p className="noticeItemDate">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("ko-KR")
                      : ""}
                  </p>
                </div>
              ))}
            </div>

            {/* 페이지네이션 (추후 구현) */}
            <div className="pagination">
              <button
                className="pageBtn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                &lt;
              </button>

              <button
                className={`pageBtn ${page === 1 ? "active" : ""}`}
                onClick={() => setPage(1)}
              >
                1
              </button>

              <button className="pageBtn" onClick={() => setPage(page + 1)}>
                &gt;
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
