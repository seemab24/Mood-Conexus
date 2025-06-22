// src/components/ExcelUploader.jsx
import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import './ExcelUploader.css';
import Navigation from '../navigation/Navigation';
import Footer from '../footer/Footer';

function ExcelUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ anime: 0, books: 0 });
  const [status, setStatus] = useState('');
  const [dragActive, setDragActive] = useState({ anime: false, books: false });
  const [files, setFiles] = useState({ anime: null, books: null });
  const [previewData, setPreviewData] = useState({ anime: null, books: null });
  const [uploadStats, setUploadStats] = useState({ anime: {}, books: {} });
  const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'preview', 'stats'
  const uploadTimerRef = useRef(null);
  const [uploadTime, setUploadTime] = useState({ anime: 0, books: 0 });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: '', message: '' });

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
    };
  }, []);

  // Show toast notification
  const displayToast = (type, message) => {
    setToastMessage({ type, message });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const generateDataPreview = async (file, type) => {
    if (!file) return;
    
    try {
      const data = await readExcelFile(file);
      const preview = data.slice(0, 5); // Show first 5 rows
      setPreviewData(prev => ({ ...prev, [type]: preview }));
      return data;
    } catch (error) {
      displayToast('error', `Error generating preview: ${error.message}`);
      return null;
    }
  };

  const uploadToFirestore = async (data, collectionName) => {
    try {
      setStatus(`Uploading to ${collectionName}...`);
      
      // Start timer for measuring upload time
      const startTime = Date.now();
      uploadTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setUploadTime(prev => ({
          ...prev,
          [collectionName === 'animes' ? 'anime' : 'books']: elapsed
        }));
      }, 1000);
      
      // Use batched writes for better performance
      let batch = writeBatch(db);
      let count = 0;
      const batchSize = 500; // Firestore batch size limit is 500
      const totalItems = data.length;
      let totalBatches = Math.ceil(totalItems / batchSize);
      let completedBatches = 0;
      
      for (let i = 0; i < totalItems; i++) {
        const docRef = doc(collection(db, collectionName));
        batch.set(docRef, data[i]);
        
        count++;
        
        // When we reach batch size limit or at the end, commit and create a new batch
        if (count === batchSize || i === totalItems - 1) {
          await batch.commit();
          completedBatches++;
          
          // Update progress
          const progressPercent = Math.round((completedBatches / totalBatches) * 100);
          setProgress(prev => ({
            ...prev,
            [collectionName === 'animes' ? 'anime' : 'books']: progressPercent
          }));
          
          // Reset for next batch
          batch = writeBatch(db);
          count = 0;
        }
      }
      
      // Clear timer
      clearInterval(uploadTimerRef.current);
      
      // Calculate statistics
      const endTime = Date.now();
      const totalTime = (endTime - startTime) / 1000;
      const docsPerSecond = Math.round((totalItems / totalTime) * 100) / 100;
      
      // Update stats
      setUploadStats(prev => ({
        ...prev,
        [collectionName === 'animes' ? 'anime' : 'books']: {
          totalDocuments: totalItems,
          batches: totalBatches,
          totalTimeSeconds: totalTime,
          docsPerSecond,
          timestamp: new Date().toLocaleString()
        }
      }));
      
      setStatus(`Successfully uploaded ${totalItems} documents to ${collectionName}`);
      displayToast('success', `${collectionName} upload complete!`);
      return true;
    } catch (error) {
      setStatus(`Error uploading to ${collectionName}: ${error.message}`);
      console.error("Error uploading to Firestore:", error);
      displayToast('error', `Upload failed: ${error.message}`);
      return false;
    }
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      // Store the file reference
      setFiles(prev => ({ ...prev, [type]: file }));
      
      // Generate preview
      const data = await generateDataPreview(file, type);
      if (!data) return;
      
      displayToast('info', `${file.name} loaded successfully`);
    } catch (error) {
      setStatus(`Error processing ${type} file: ${error.message}`);
      console.error(`Error processing ${type} file:`, error);
      displayToast('error', `Error processing file: ${error.message}`);
    }
  };
  
  const startUpload = async (type) => {
    const file = files[type];
    if (!file) {
      displayToast('error', 'Please select a file first');
      return;
    }
    
    try {
      setUploading(true);
      setStatus(`Reading ${type} file...`);
      
      const data = await readExcelFile(file);
      setStatus(`Parsed ${data.length} rows from ${type} file`);
      
      const collectionName = type === 'anime' ? 'animes' : 'books';
      await uploadToFirestore(data, collectionName);
      
      setStatus(`${type} data upload completed!`);
    } catch (error) {
      setStatus(`Error processing ${type} file: ${error.message}`);
      console.error(`Error processing ${type} file:`, error);
      displayToast('error', `Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e, type, active) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: active }));
  };

  const handleDrop = async (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
    
    const file = e.dataTransfer.files[0];
    if (!file || (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls'))) {
      displayToast('error', 'Please drop a valid Excel file (.xlsx or .xls)');
      return;
    }
    
    // Create a synthetic event object to reuse handleFileUpload
    const syntheticEvent = { target: { files: [file] } };
    handleFileUpload(syntheticEvent, type);
  };
  
  // Clear selected file
  const clearFile = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
    setPreviewData(prev => ({ ...prev, [type]: null }));
    setProgress(prev => ({ ...prev, [type]: 0 }));
  };

  const renderDataTable = (data, type) => {
    if (!data || data.length === 0) return null;
    
    const columns = Object.keys(data[0]);
    
    return (
        
      <div className="data-preview-table">
        {/* <Navigation/> */}
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {columns.map(col => (
                  <td key={`${idx}-${col}`}>{String(row[col] || '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="preview-footer">
          <span>Showing 5 of {files[type] ? `${previewData[type].length} rows` : '0 rows'}</span>
        </div>
      </div>
    );
  };

  const renderUploadSection = (type) => {
    const file = files[type];
    const progressValue = progress[type];
    const uploadInProgress = uploading && progressValue > 0 && progressValue < 100;
    
    return (
        
      <div className="upload-card">

        <div className={`card-header ${type}`}>
          <div className="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {type === 'anime' ? (
                <><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></>
              ) : (
                <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>
              )}
            </svg>
          </div>
          <h3>{type === 'anime' ? 'Anime Data' : 'Books Data'}</h3>
        </div>
        
        {!file ? (
          <div 
            className={`dropzone ${dragActive[type] ? 'active' : ''} ${uploading ? 'disabled' : ''}`}
            onDragEnter={(e) => handleDrag(e, type, true)}
            onDragLeave={(e) => handleDrag(e, type, false)}
            onDragOver={(e) => handleDrag(e, type, true)}
            onDrop={(e) => handleDrop(e, type)}
          >
            <input 
              type="file" 
              id={`${type}-upload`}
              className="file-input"
              accept=".xlsx, .xls" 
              onChange={(e) => handleFileUpload(e, type)}
              disabled={uploading}
            />
            <label htmlFor={`${type}-upload`} className="dropzone-label">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>{dragActive[type] ? 'Drop file here' : 'Click or drag Excel file'}</span>
            </label>
          </div>
        ) : (
          <div className="file-selected">
            <div className="file-info">
              <div className="file-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M8 13h2"></path>
                  <path d="M8 17h2"></path>
                  <path d="M14 13h2"></path>
                  <path d="M14 17h2"></path>
                </svg>
              </div>
              <div className="file-details">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              {!uploading && (
                <button 
                  className="clear-file-btn" 
                  onClick={() => clearFile(type)}
                  aria-label="Clear file"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
            
            <div className="upload-actions">
              <button 
                className="upload-button"
                onClick={() => startUpload(type)}
                disabled={uploading}
              >
                {uploadInProgress ? (
                  <>
                    <div className="spinner"></div>
                    <span>Uploading... {progressValue}%</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>Upload to Firebase</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {progressValue > 0 && (
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressValue}%` }}></div>
            </div>
            <div className="progress-details">
              <span className="progress-text">{progressValue}% Complete</span>
              {uploadTime[type] > 0 && (
                <span className="elapsed-time">Time: {uploadTime[type]}s</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStatsCard = (type) => {
    const stats = uploadStats[type];
    
    if (!stats.totalDocuments) {
      return (
        <div className="stats-card empty">
          <div className="stats-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <p>No upload statistics available for {type} data yet</p>
        </div>
      );
    }
    
    return (
       
      <div className="stats-card">
        <div className="stats-header">
          <h4>{type === 'anime' ? 'Anime Upload Statistics' : 'Books Upload Statistics'}</h4>
          <span className="stats-timestamp">{stats.timestamp}</span>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">Documents</div>
            <div className="stat-value">{stats.totalDocuments.toLocaleString()}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Batches</div>
            <div className="stat-value">{stats.batches}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Total Time</div>
            <div className="stat-value">{stats.totalTimeSeconds.toFixed(2)}s</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Speed</div>
            <div className="stat-value">{stats.docsPerSecond} docs/s</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    
    <div className={`excel-uploader-container theme-${activeTab}`}>
         <Navigation/>
      <div className="uploader-header">
        <h2>Excel Data Uploader</h2>
        <p className="uploader-description">
          Import and upload Excel files to Firestore database
        </p>
      </div>
      
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Upload Files
        </button>
        <button 
          className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Data Preview
        </button>
        <button 
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Upload Stats
        </button>
      </div>
      
      {activeTab === 'upload' && (
        <div className="upload-cards-container">
          {renderUploadSection('anime')}
          {renderUploadSection('books')}
        </div>
      )}
      
      {activeTab === 'preview' && (
        <div className="preview-section">
          <div className="preview-tabs">
            <button 
              className={`preview-tab ${!previewData.books || previewData.anime ? 'active' : ''}`}
              onClick={() => {}}
              disabled={!previewData.anime}
            >
              Anime Data
            </button>
            <button 
              className={`preview-tab ${previewData.books && !previewData.anime ? 'active' : ''}`}
              onClick={() => {}}
              disabled={!previewData.books}
            >
              Books Data
            </button>
          </div>
          
          <div className="preview-content">
            {(previewData.anime || previewData.books) ? (
              <>
                {previewData.anime && renderDataTable(previewData.anime, 'anime')}
                {previewData.books && !previewData.anime && renderDataTable(previewData.books, 'books')}
              </>
            ) : (
              <div className="empty-preview">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>No data preview available. Please upload an Excel file first.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'stats' && (
        <div className="stats-container">
          {renderStatsCard('anime')}
          {renderStatsCard('books')}
        </div>
      )}
      
      {status && (
        <div className="status-container">
          <div className={`status-message ${status.includes('Error') ? 'error' : status.includes('completed') ? 'success' : 'info'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {status.includes('Error') ? (
                <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>
              ) : status.includes('completed') ? (
                <><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></>
              ) : (
                <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>
              )}
            </svg>
            <p>{status}</p>
          </div>
        </div>
      )}
      
      {showToast && (
        <div className={`toast-notification ${toastMessage.type}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {toastMessage.type === 'error' ? (
              <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>
            ) : toastMessage.type === 'success' ? (
              <><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></>
            ) : (
              <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>
            )}
          </svg>
          <p>{toastMessage.message}</p>
          <button className="close-toast" onClick={() => setShowToast(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
      <Footer/>
    </div>
  );
}

export default ExcelUploader;





