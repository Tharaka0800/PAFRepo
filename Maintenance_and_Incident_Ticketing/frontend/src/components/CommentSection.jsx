import React, { useState, useEffect } from 'react';
import { fetchWithAuth, API_BASE_URL } from '../config/api';

const CommentSection = ({ ticketId, currentUserId, currentUserName }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadComments();
  }, [ticketId]);

  const loadComments = async () => {
    try {
      const data = await fetchWithAuth(`/tickets/${ticketId}/comments`);
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const payload = { text: newComment };
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId,
          'X-User-Name': currentUserName
        },
        body: JSON.stringify(payload)
      });
      if(response.ok) {
        setNewComment('');
        loadComments();
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete comment?')) return;
    try {
      await fetch(`${API_BASE_URL}/comments/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': currentUserId }
      });
      loadComments();
    } catch(err) {
      console.error(err);
    }
  };

  const handleEdit = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': currentUserId },
        body: JSON.stringify({text: editText})
      });
      setEditingId(null);
      loadComments();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-panel" style={{flex: 1, padding: '24px'}}>
      <h3 style={{marginTop: 0, color: 'var(--primary-color)'}}>Comments & Updates</h3>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px'}}>
        <textarea 
          className="input-field" 
          rows="3" 
          placeholder="Add a comment or update..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        ></textarea>
        <button 
          className="btn btn-primary" 
          style={{alignSelf: 'flex-end'}} 
          onClick={handlePostComment}
          disabled={loading || !newComment.trim()}
        >
          Post Comment
        </button>
      </div>

      <div className="comment-list">
        {comments.length === 0 ? <div style={{textAlign: 'center', color: 'gray', fontSize: '0.9rem'}}>No comments yet.</div> : null}
        
        {comments.map(c => (
          <div key={c.id} className="comment-item">
            <div className="comment-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', color: 'var(--purple-dark)', fontWeight: 'bold' }}>
                  {c.authorName ? c.authorName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="comment-author">{c.authorName} {c.userId === currentUserId && '(You)'}</span>
              </div>
              <span className="comment-date">{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            
            {editingId === c.id ? (
              <div>
                <textarea className="input-field" rows="2" value={editText} onChange={e => setEditText(e.target.value)} style={{marginBottom: '8px'}}></textarea>
                <div style={{display: 'flex', gap: '8px'}}>
                  <button className="btn btn-primary" style={{padding: '4px 12px', fontSize: '0.8rem'}} onClick={() => handleEdit(c.id)}>Save</button>
                  <button className="btn btn-secondary" style={{padding: '4px 12px', fontSize: '0.8rem'}} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
                <>
                <div style={{color: 'var(--text-dark)', fontSize: '0.95rem', whiteSpace: 'pre-wrap'}}>{c.text}</div>
                {c.userId === currentUserId && (
                    <div style={{display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0'}}>
                      <button onClick={()=>{setEditingId(c.id); setEditText(c.text)}} style={{fontSize: '0.8rem', color: 'var(--secondary-color)', background: 'none', border: 'none', cursor: 'pointer', padding: 0}}>Edit</button>
                      <button onClick={()=>{handleDelete(c.id)}} style={{fontSize: '0.8rem', color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer', padding: 0}}>Delete</button>
                    </div>
                )}
                </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default CommentSection;
