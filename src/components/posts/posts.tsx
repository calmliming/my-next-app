'use client';

import { useEffect, useState } from 'react';

// 文章类型定义
type Post = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function Posts() {
  // 文章列表状态
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 表单状态（新增/编辑共用）
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // 编辑相关状态
  const [editingId, setEditingId] = useState<string | null>(null); // 当前编辑的文章ID
  const [loadingEdit, setLoadingEdit] = useState(false); // 加载编辑数据的状态

  // 删除相关状态
  const [deletingId, setDeletingId] = useState<string | null>(null); // 正在删除的文章ID

  // 加载文章列表
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('获取文章列表失败');
      const res = await response.json();
      console.log('res:', res);
      setPosts(res.data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载文章失败');
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取文章
  useEffect(() => {
    fetchPosts();
  }, []);

  // 点击"编辑"按钮：加载文章详情到表单
  const handleEdit = async (id: string) => {
    setLoadingEdit(true);
    setSubmitMessage('');
    try {
      const response = await fetch(`/api/posts/${id}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || '加载文章失败');
      }
      const post = await response.json();
      // 填充表单
      setTitle(post.title);
      setContent(post.content);
      setEditingId(id); // 标记为编辑状态
    } catch (err) {
      setSubmitMessage(err instanceof Error ? err.message : '编辑失败');
    } finally {
      setLoadingEdit(false);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
    setSubmitMessage('');
  };

  // 提交表单（新增或编辑）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage('');

    try {
      let response;
      if (editingId) {
        // 编辑：调用PUT接口
        response = await fetch(`/api/posts/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        });
      } else {
        // 新增：调用POST接口
        response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        });
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || '操作失败');

      // 操作成功
      setSubmitMessage(editingId ? '✅ 文章修改成功' : '🎉 文章发布成功');
      setTitle('');
      setContent('');
      setEditingId(null); // 退出编辑状态
      fetchPosts(); // 刷新列表
    } catch (err) {
      setSubmitMessage(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || '删除失败');

      setSubmitMessage('🗑️ 文章已删除');
      fetchPosts(); // 刷新列表
    } catch (err) {
      setSubmitMessage(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  // 加载中状态
  if (loading) return <div style={styles.container}>加载中...</div>;

  return (
    <div style={styles.container}>
      <h1>文章管理系统</h1>

      {/* 发布/编辑表单 */}
      <div style={styles.formBox}>
        <h2>{editingId ? '编辑文章' : '发布新文章'}</h2>
        {loadingEdit ? (
          <p>加载文章中...</p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formItem}>
              <label>标题：</label>
              <input
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
                placeholder='请输入标题'
                disabled={submitting}
              />
            </div>

            <div style={styles.formItem}>
              <label>内容：</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  resize: 'vertical',
                }}
                placeholder='请输入内容'
                rows={5}
                disabled={submitting}
              />
            </div>

            <div style={styles.buttons}>
              <button
                type='submit'
                style={styles.mainBtn}
                disabled={submitting}
              >
                {submitting
                  ? editingId
                    ? '保存中...'
                    : '发布中...'
                  : editingId
                  ? '保存修改'
                  : '发布文章'}
              </button>

              {editingId && (
                <button
                  type='button'
                  style={styles.cancelBtn}
                  onClick={handleCancelEdit}
                  disabled={submitting}
                >
                  取消
                </button>
              )}
            </div>

            {submitMessage && (
              <p
                style={
                  submitMessage.includes('成功') ||
                  submitMessage.includes('已删除')
                    ? styles.success
                    : styles.error
                }
              >
                {submitMessage}
              </p>
            )}
          </form>
        )}
      </div>

      {/* 文章列表 */}
      <div style={styles.listBox}>
        <h2>文章列表</h2>
        {error ? (
          <p style={styles.error}>{error}</p>
        ) : posts.length === 0 ? (
          <p>暂无文章，发布一篇试试吧～</p>
        ) : (
          <div style={styles.postList}>
            {posts.map((post) => (
              <div key={post._id} style={styles.postItem}>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <small>发布时间：{post.createdAt}</small>

                {/* 编辑和删除按钮（关键部分！） */}
                <div style={styles.actionBtns}>
                  <button
                    style={styles.editBtn}
                    onClick={() => handleEdit(post._id)}
                    disabled={deletingId === post._id || submitting}
                  >
                    编辑
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(post._id)}
                    disabled={
                      deletingId === post._id ||
                      submitting ||
                      editingId === post._id
                    }
                  >
                    {deletingId === post._id ? '删除中...' : '删除'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 样式定义（确保按钮可见）
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  formBox: {
    border: '1px solid #ddd',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  formItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
  },
  input: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  textarea: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    resize: 'vertical',
  },
  buttons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  mainBtn: {
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  success: {
    color: 'green',
    marginTop: '10px',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
  listBox: {
    marginTop: '20px',
  },
  postList: {
    marginTop: '10px',
  },
  postItem: {
    border: '1px solid #eee',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  actionBtns: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
  },
  editBtn: {
    padding: '6px 12px',
    backgroundColor: '#4CAF50', // 绿色按钮
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#f44336', // 红色按钮（醒目）
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
