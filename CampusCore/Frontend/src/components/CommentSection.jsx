import React, { useState, useEffect } from 'react';
import { fetchWithAuth, API_BASE_URL } from '../config/api';

const CommentSection = ({ ticketId, currentUserId, currentUserName }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const formatCommentDate = (value) => {
    const date = value ? new Date(value) : new Date();
    if (isNaN(date.getTime())) {
      return new Date().toLocaleString();
    }
    return date.toLocaleString();
  };

  const getAlertMessage = (message) => {
    if (!message) return '🌟 Something went wrong. Let\'s try that again!';
    if (message.toLowerCase().includes('connection lost') || message.toLowerCase().includes('no response')) {
      return '☁️ Cloud Connection Issue: The server is taking a quick nap. Try again in a bit!';
    }
    return message;
  };

  useEffect(() => {
    loadComments();
  }, [ticketId]);

  const loadComments = async () => {
    try {
      const data = await fetchWithAuth(`/tickets/${ticketId}/comments`);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
      alert(getAlertMessage(err.message));
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const payload = { text: newComment };
      await fetchWithAuth(`/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      setNewComment('');
      loadComments();
    } catch(err) {
      console.error('Failed to post comment:', err);
      alert(getAlertMessage(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('are you want to delete')) return;
    try {
      await fetchWithAuth(`/comments/${id}`, {
        method: 'DELETE'
      });
      loadComments();
      alert('You delete comment');
    } catch(err) {
      console.error('Failed to delete comment:', err);
      alert(getAlertMessage(err.message));
    }
  };

  const handleEdit = async (id) => {
    if (!window.confirm('are you want to update')) return;
    try {
      await fetchWithAuth(`/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({text: editText})
      });
      setEditingId(null);
      loadComments();
      alert('comment update sucessfully');
    } catch(err) {
      console.error('Failed to edit comment:', err);
      alert(getAlertMessage(err.message));
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
              <span className="comment-date">{formatCommentDate(c.createdAt)}</span>
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
