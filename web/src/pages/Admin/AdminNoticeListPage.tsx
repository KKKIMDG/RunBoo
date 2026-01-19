import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import type { Notice } from "../../types/admin";
import Header from "../../components/header/Header";
import "./AdminNoticeListPage.css";

const AdminNoticeListPage = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.getAllNotices();
      // 최신 순으로 정렬 (id 또는 createdAt 기준 내림차순)
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
      if (err instanceof Error && err.message.includes("권한")) {
        setTimeout(() => navigate("/admin/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminApi.logout();
      alert("로그아웃되었습니다.");
      navigate("/admin/login");
    } catch (err) {
      alert("로그아웃에 실패했습니다.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) {
      return;
    }

    try {
      await adminApi.deleteNotice(id);
      alert("삭제되었습니다.");
      fetchNotices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  const handleCreate = () => {
    navigate("/admin/notices/create");
  };

  const handleEdit = (id: number) => {
    navigate(`/admin/notices/edit/${id}`);
  };

  return (
    <div className="admin-notice-page">
      <Header />

      <div className="admin-content">
        <div className="notice-list-section">
          <div className="notice-list-header">
            <h2>공지사항 목록</h2>
            <button onClick={handleCreate} className="create-notice-button">
              새 공지사항 작성
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">로딩 중...</div>
          ) : notices.length === 0 ? (
            <div className="empty-message">등록된 공지사항이 없습니다.</div>
          ) : (
            <div className="notice-list">
              {notices.map((notice) => (
                <div key={notice.id} className="notice-item">
                  <div className="notice-header">
                    <div className="notice-title-wrapper">
                      <h3>{notice.title}</h3>
                      {notice.createdAt && (
                        <p className="notice-date">
                          {new Date(notice.createdAt).toLocaleDateString(
                            "ko-KR",
                          )}
                        </p>
                      )}
                    </div>
                    <div className="notice-actions">
                      <button
                        onClick={() => notice.id && handleEdit(notice.id)}
                        className="edit-button"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => notice.id && handleDelete(notice.id)}
                        className="delete-button"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNoticeListPage;
