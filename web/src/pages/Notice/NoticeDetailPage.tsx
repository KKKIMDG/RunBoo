import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { noticeApi } from "../../api/noticeApi";
import type { Notice } from "../../types/admin";
import "./NoticeDetailPage.css";

const NoticeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchNotice(Number(id));
    }
  }, [id]);

  const fetchNotice = async (noticeId: number) => {
    setLoading(true);
    setError("");
    try {
      const data = await noticeApi.getNoticeById(noticeId);
      setNotice(data);
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

  const handleBack = () => {
    navigate("/notice");
  };

  if (loading) {
    return (
      <section className="noticeDetailPage">
        <div className="noticeDetailInner">
          <div className="loading">로딩 중...</div>
        </div>
      </section>
    );
  }

  if (error || !notice) {
    return (
      <section className="noticeDetailPage">
        <div className="noticeDetailInner">
          <div className="error">{error || "공지사항을 찾을 수 없습니다."}</div>
          <button onClick={handleBack} className="backButton">
            목록으로
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="noticeDetailPage">
      <div className="noticeDetailInner">
        <button onClick={handleBack} className="backButton">
          ← 목록으로
        </button>

        <article className="noticeDetail">
          <header className="noticeDetailHeader">
            <h1 className="noticeDetailTitle">{notice.title}</h1>
            {notice.createdAt && (
              <p className="noticeDetailDate">
                {new Date(notice.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </header>

          <div className="noticeDetailContent">{notice.content}</div>
        </article>
      </div>
    </section>
  );
};

export default NoticeDetailPage;
