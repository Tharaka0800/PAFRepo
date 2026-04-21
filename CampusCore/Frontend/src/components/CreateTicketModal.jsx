import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';

const CreateTicketModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    resourceLocation: '',
    category: 'Hardware',
    description: '',
    priority: 'LOW',
    preferredContact: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 3) {
      setError('Maximum 3 attachments allowed');
      return;
    }
    setError(null);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const submitData = new FormData();
    // Convert text inputs to JSON blob for @RequestParam in Spring Boot
    submitData.append('ticketData', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
    
    files.forEach(file => {
      submitData.append('files', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'X-User-Id': 'user_123',
          // Note: Do not set Content-Type to multipart/form-data manually, browser needs to set the exact boundary
        },
        body: submitData
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to create ticket');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
// Handle input changes for text fields and selects
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Raise New Incident Ticket</h2>
        
        {error && <div style={{ padding: '10px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Resource / Location</label>
            <input type="text" name="resourceLocation" className="input-field" required value={formData.resourceLocation} onChange={handleChange} placeholder="e.g. Computing Lab 01, Projector A" />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Category</label>
              <select name="category" className="input-field" value={formData.category} onChange={handleChange}>
                <option>Hardware</option>
                <option>Software</option>
                <option>Network</option>
                <option>Facility</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Priority</label>
              <select name="priority" className="input-field" value={formData.priority} onChange={handleChange}>
                <option>LOW</option>
                <option>MEDIUM</option>
                <option>HIGH</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Description</label>
            <textarea name="description" className="input-field" required rows="4" value={formData.description} onChange={handleChange} placeholder="Describe the issue in detail..."></textarea>
          </div>

          <div className="form-group">
            <label className="label">Preferred Contact Number / Email</label>
            <input type="text" name="preferredContact" className="input-field" required value={formData.preferredContact} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="label">Evidence Attachments (Max 3 Images)</label>
            <div className="file-drop-area" onClick={() => document.getElementById('fileUpload').click()}>
              <input type="file" id="fileUpload" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} disabled={files.length >= 3} />
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Click or Drag files to attach (Images only)</p>
            </div>
            
            {files.length > 0 && (
              <div className="image-preview-group">
                {files.map((file, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img src={URL.createObjectURL(file)} className="image-preview" alt="preview" />
                    <button type="button" onClick={() => removeFile(index)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger-color)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', lineHeight: '18px', padding: 0 }}>&times;</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
