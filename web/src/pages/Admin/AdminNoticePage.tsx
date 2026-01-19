import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import type { Notice } from "../../types/admin";
import "./AdminNoticePage.css";

const AdminNoticePage = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.getAllNotices();
      setNotices(data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (editingNotice && editingNotice.id) {
        // 수정
        await adminApi.updateNotice(editingNotice.id, formData);
        alert("공지사항이 수정되었습니다.");
      } else {
        // 생성
        await adminApi.createNotice(formData);
        alert("공지사항이 생성되었습니다.");
      }

      // 폼 초기화
      setFormData({ title: "", content: "" });
      setIsEditing(false);
      setEditingNotice(null);

      // 목록 새로고침
      fetchNotices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "작업에 실패했습니다.");
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
    });
    setIsEditing(true);
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

  const handleCancel = () => {
    setIsEditing(false);
    setEditingNotice(null);
    setFormData({ title: "", content: "" });
    setError("");
  };

  return (
    <div className="admin-notice-page">
      <div className="admin-header">
        <h1>관리자 공지사항 관리</h1>
        <button onClick={handleLogout} className="logout-button">
          로그아웃
        </button>
      </div>

      <div className="admin-content">
        {/* 공지사항 작성/수정 폼 */}
        <div className="notice-form-section">
          <h2>{isEditing ? "공지사항 수정" : "새 공지사항 작성"}</h2>
          <form onSubmit={handleSubmit} className="notice-form">
            <div className="form-group">
              <label htmlFor="title">제목</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="공지사항 제목을 입력하세요"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">내용</label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="공지사항 내용을 입력하세요"
                rows={10}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="submit-button">
                {isEditing ? "수정하기" : "작성하기"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-button"
                >
                  취소
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 공지사항 목록 */}
        <div className="notice-list-section">
          <h2>공지사항 목록</h2>
          {loading ? (
            <div className="loading">로딩 중...</div>
          ) : notices.length === 0 ? (
            <div className="empty-message">등록된 공지사항이 없습니다.</div>
          ) : (
            <div className="notice-list">
              {notices.map((notice) => (
                <div key={notice.id} className="notice-item">
                  <div className="notice-header">
                    <h3>{notice.title}</h3>
                    <div className="notice-actions">
                      <button
                        onClick={() => handleEdit(notice)}
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
                  <div className="notice-content">{notice.content}</div>
                  {notice.createdAt && (
                    <div className="notice-date">
                      작성일:{" "}
                      {new Date(notice.createdAt).toLocaleString("ko-KR")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNoticePage;
