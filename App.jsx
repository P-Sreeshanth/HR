import React, { useState, useRef } from 'react';

const API_URL = 'http://localhost:8000';

function App() {
    const [handoffId, setHandoffId] = useState(null);
    const [status, setStatus] = useState('idle');
    const [uploadResult, setUploadResult] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const startHandoff = async () => {
        setStatus('starting');
        const formData = new FormData();
        formData.append('job_id', 'JOB-001');
        formData.append('user_id', 'USER-001');
        const response = await fetch(`${API_URL}/handoff/start`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        setHandoffId(data.handoff_id);
        setStatus('waiting');
        window.open('https://rms.naukri.com', '_blank');
    };

    const handleFileUpload = async (files) => {
        if (!files.length || !handoffId) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('handoff_id', handoffId);
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        const response = await fetch(`${API_URL}/resumes/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        setUploadResult(data);
        setStatus('complete');
        setIsUploading(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d0d1a 100%)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            color: '#ffffff',
            padding: '40px 20px',
        },
        wrapper: {
            maxWidth: '800px',
            margin: '0 auto',
        },
        header: {
            textAlign: 'center',
            marginBottom: '50px',
        },
        logo: {
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '3px',
            color: '#6366f1',
            textTransform: 'uppercase',
            marginBottom: '16px',
        },
        title: {
            fontSize: '42px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px',
        },
        subtitle: {
            fontSize: '18px',
            color: '#94a3b8',
            fontWeight: '400',
        },
        card: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '40px',
            marginBottom: '24px',
        },
        importButton: {
            width: '100%',
            padding: '20px 32px',
            fontSize: '18px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
        },
        statusBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '100px',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '30px',
        },
        waitingBadge: {
            background: 'rgba(251, 191, 36, 0.15)',
            color: '#fbbf24',
            border: '1px solid rgba(251, 191, 36, 0.3)',
        },
        completeBadge: {
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#22c55e',
            border: '1px solid rgba(34, 197, 94, 0.3)',
        },
        dropzone: {
            border: `2px dashed ${isDragging ? '#6366f1' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: '20px',
            padding: '60px 40px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            background: isDragging ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
            cursor: 'pointer',
        },
        dropIcon: {
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '28px',
        },
        dropText: {
            fontSize: '18px',
            color: '#e2e8f0',
            marginBottom: '8px',
        },
        dropSubtext: {
            fontSize: '14px',
            color: '#64748b',
        },
        hiddenInput: {
            display: 'none',
        },
        resultCard: {
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '16px',
            padding: '24px',
        },
        resultHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
        },
        resultIcon: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
        },
        resultTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#22c55e',
        },
        fileList: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
        },
        fileItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            marginBottom: '8px',
        },
        fileIcon: {
            fontSize: '20px',
        },
        fileName: {
            fontSize: '14px',
            color: '#e2e8f0',
        },
        uploadingOverlay: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
        },
        spinner: {
            width: '48px',
            height: '48px',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
        },
        stepIndicator: {
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '40px',
        },
        step: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
        },
    };

    const getStepStyle = (stepNum) => {
        const currentStep = status === 'idle' ? 0 : status === 'waiting' ? 1 : 2;
        return {
            ...styles.step,
            background: stepNum <= currentStep ? '#6366f1' : 'rgba(255, 255, 255, 0.2)',
            transform: stepNum === currentStep ? 'scale(1.5)' : 'scale(1)',
        };
    };

    return (
        <div style={styles.container}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                button:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5) !important; }
            `}</style>

            <div style={styles.wrapper}>
                <div style={styles.header}>
                    <div style={styles.logo}>Qylis HRR</div>
                    <h1 style={styles.title}>Resume Ingestion</h1>
                    <p style={styles.subtitle}>Import resumes from Naukri RMS with one click</p>
                </div>

                <div style={styles.stepIndicator}>
                    <div style={getStepStyle(0)}></div>
                    <div style={getStepStyle(1)}></div>
                    <div style={getStepStyle(2)}></div>
                </div>

                <div style={styles.card}>
                    {status === 'idle' && (
                        <button style={styles.importButton} onClick={startHandoff}>
                            <span>📥</span>
                            Import from Naukri RMS
                        </button>
                    )}

                    {status === 'waiting' && (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <div style={{ ...styles.statusBadge, ...styles.waitingBadge }}>
                                    <span style={{ animation: 'pulse 2s infinite' }}>●</span>
                                    Waiting for resumes from Naukri...
                                </div>
                            </div>

                            <div
                                style={styles.dropzone}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isUploading ? (
                                    <div style={styles.uploadingOverlay}>
                                        <div style={styles.spinner}></div>
                                        <p style={styles.dropText}>Uploading resumes...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div style={styles.dropIcon}>📄</div>
                                        <p style={styles.dropText}>Drop your resume files here</p>
                                        <p style={styles.dropSubtext}>or click to browse • PDF, DOCX, ZIP supported</p>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.docx,.zip"
                                    onChange={(e) => handleFileUpload(e.target.files)}
                                    style={styles.hiddenInput}
                                />
                            </div>
                        </>
                    )}

                    {status === 'complete' && uploadResult && (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <div style={{ ...styles.statusBadge, ...styles.completeBadge }}>
                                    <span>✓</span>
                                    Upload complete
                                </div>
                            </div>

                            <div style={styles.resultCard}>
                                <div style={styles.resultHeader}>
                                    <div style={styles.resultIcon}>✓</div>
                                    <div style={styles.resultTitle}>
                                        {uploadResult.count} Resume{uploadResult.count > 1 ? 's' : ''} Uploaded
                                    </div>
                                </div>
                                <ul style={styles.fileList}>
                                    {uploadResult.uploaded.map((file) => (
                                        <li key={file.id} style={styles.fileItem}>
                                            <span style={styles.fileIcon}>📄</span>
                                            <span style={styles.fileName}>{file.file_name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                style={{ ...styles.importButton, marginTop: '24px' }}
                                onClick={() => {
                                    setStatus('idle');
                                    setHandoffId(null);
                                    setUploadResult(null);
                                }}
                            >
                                <span>🔄</span>
                                Start New Import
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
