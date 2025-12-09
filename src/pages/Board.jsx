import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageClassifier from '../components/ImageClassifier';

const Board = ({ title, endpoint }) => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // 모달 상태
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // 폼 데이터
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', file: null });
  const [commentInput, setCommentInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    axios.get('/api/me').then(res => setCurrentUser(res.data)).catch(() => setCurrentUser(null));
    fetchPosts();
  }, [endpoint]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(endpoint);
      setPosts(res.data);
    } catch (err) { console.error(err); }
  };

  const handleOpenWriteModal = (post = null) => {
    if (post) {
      setIsEditing(true);
      setFormData({ title: post.title, content: post.content, file: null });
      setDetailModalOpen(false);
    } else {
      setIsEditing(false);
      setFormData({ title: '', content: '', file: null });
    }
    setWriteModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title) return alert("제목을 입력하세요.");
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    if (formData.file) data.append('file', formData.file);

    try {
      if (isEditing) await axios.put(`${endpoint}/${selectedPost._id}`, data);
      else await axios.post(endpoint, data);
      
      alert(isEditing ? "수정됨" : "저장됨");
      setWriteModalOpen(false);
      fetchPosts();
    } catch { alert("오류 발생"); }
  };

  const handleDelete = async (id) => {
    if (confirm("삭제하시겠습니까?")) {
      await axios.delete(`${endpoint}/${id}`);
      setDetailModalOpen(false);
      fetchPosts();
    }
  };

  const handleVote = async (type) => {
    await axios.post(`${endpoint}/${selectedPost._id}/${type}`);
    fetchPosts();
    // 상세창 업데이트를 위해 간단히 재로딩 (실제로는 state update 권장)
    setDetailModalOpen(false); 
  };

  const handleCommentSubmit = async () => {
    if(!commentInput) return;
    await axios.post(`${endpoint}/${selectedPost._id}/comments`, { content: commentInput });
    setCommentInput('');
    setDetailModalOpen(false);
    fetchPosts();
    alert("댓글 등록");
  };

  return (
    <>
      <div className="sub-banner"><h2>{title}</h2></div>
      <div className="container">
        <div className="content-header">
          <h3>{title} 목록</h3>
          <button className="btn" onClick={() => handleOpenWriteModal(null)}>+ 글쓰기</button>
        </div>

        <table className="board-table">
          <thead><tr><th>No</th><th>제목</th><th>작성자</th><th>날짜</th></tr></thead>
          <tbody>
            {posts.map((post, idx) => (
              <tr key={post._id}>
                <td>{idx + 1}</td>
                <td onClick={() => { setSelectedPost(post); setDetailModalOpen(true); }} style={{cursor:'pointer', textAlign:'left', paddingLeft:'20px'}}>
                  {post.title} {post.fileName && '📎'}
                </td>
                <td>{post.authorName}</td>
                <td>{new Date(post.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 글쓰기 모달 */}
        {writeModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{isEditing ? '글 수정' : '글 작성'}</h3>
              <input type="text" placeholder="제목" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <textarea rows="8" placeholder="내용" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
              <ImageClassifier onImageSelect={(file) => setFormData({...formData, file: file})} />
              <div style={{marginTop:'10px', textAlign:'right'}}>
                <button className="btn" onClick={handleSubmit}>저장</button>
                <button className="btn btn-del" onClick={() => setWriteModalOpen(false)}>취소</button>
              </div>
            </div>
          </div>
        )}

        {/* 상세 보기 모달 */}
        {detailModalOpen && selectedPost && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{selectedPost.title}</h3>
              <p style={{color:'#888', fontSize:'0.9rem'}}>By {selectedPost.authorName} | {new Date(selectedPost.createdAt).toLocaleString()}</p>
              <hr style={{margin:'10px 0'}}/>
              {selectedPost.fileName && <img src={`/uploads/${selectedPost.fileName}`} alt="img" style={{maxWidth:'100%', maxHeight:'300px', borderRadius:'5px'}} />}
              <pre style={{whiteSpace:'pre-wrap', marginTop:'15px'}}>{selectedPost.content}</pre>
              
              <div style={{textAlign:'center', margin:'20px 0'}}>
                 <button className="btn" style={{background:'white', color:'#3498db', border:'1px solid #3498db', marginRight:'5px'}} onClick={()=>handleVote('like')}>👍 {selectedPost.likes.length}</button>
                 <button className="btn" style={{background:'white', color:'#e74c3c', border:'1px solid #e74c3c'}} onClick={()=>handleVote('dislike')}>👎 {selectedPost.dislikes.length}</button>
              </div>

              {currentUser && parseInt(selectedPost.userId) === parseInt(currentUser.userId) && (
                <div style={{textAlign:'right'}}>
                  <button className="btn" onClick={() => handleOpenWriteModal(selectedPost)} style={{background:'#f39c12', marginRight:'5px'}}>수정</button>
                  <button className="btn btn-del" onClick={() => handleDelete(selectedPost._id)}>삭제</button>
                </div>
              )}
              
              <hr style={{margin:'20px 0'}}/>
              <h4>댓글 ({selectedPost.comments.length})</h4>
              {selectedPost.comments.map((c, i) => (
                  <div key={i} style={{borderBottom:'1px solid #eee', padding:'5px'}}>
                      <b>{c.authorName}</b>: {c.content}
                  </div>
              ))}
              <div style={{display:'flex', marginTop:'10px'}}>
                  <input type="text" value={commentInput} onChange={e=>setCommentInput(e.target.value)} placeholder="댓글..." style={{marginBottom:0}} />
                  <button className="btn" onClick={handleCommentSubmit} style={{marginLeft:'5px'}}>등록</button>
              </div>
              
              <button className="btn" onClick={() => setDetailModalOpen(false)} style={{marginTop:'20px', width:'100%', background:'#888'}}>닫기</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Board;