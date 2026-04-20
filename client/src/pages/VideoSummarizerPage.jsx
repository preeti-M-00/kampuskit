import React, { useState } from 'react';

const VideoSummarizerPage = () => {
  const [activeTab, setActiveTab] = useState('summarize');
  const [videoFile, setVideoFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVideoSummarize = async () => {
    if (!videoFile) return;
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const formData = new FormData();
      formData.append('video_file', videoFile);
      const res = await fetch('http://127.0.0.1:8000/video-summarize', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed');
      setAnswer(data.answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleYoutubeQna = async () => {
    if (!youtubeUrl || !query) return;
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const res = await fetch('http://127.0.0.1:8000/youtube-qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl, query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed');
      setAnswer(data.answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #2a1b5e, #140a30)', color: 'white', padding: '40px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>🎬 Video Section</h1>
      <p style={{ color: '#d1c8ff', textAlign: 'center', marginBottom: '32px' }}>Summarize videos or ask questions about YouTube videos</p>

      {/* Tab Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
        <button onClick={() => setActiveTab('summarize')} style={{ padding: '10px 24px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', background: activeTab === 'summarize' ? 'linear-gradient(to right, #7c3aed, #ec4899)' : 'rgba(255,255,255,0.1)', color: 'white' }}>
          Video Summarizer
        </button>
        <button onClick={() => setActiveTab('qna')} style={{ padding: '10px 24px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', background: activeTab === 'qna' ? 'linear-gradient(to right, #7c3aed, #ec4899)' : 'rgba(255,255,255,0.1)', color: 'white' }}>
          YouTube Q&A
        </button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '32px' }}>
        {activeTab === 'summarize' ? (
          <div>
            <h2 style={{ marginBottom: '16px' }}>Upload a Video</h2>
            <input
              type="file"
              accept=".mp4,.mov,.avi,.mkv"
              onChange={(e) => setVideoFile(e.target.files[0])}
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', marginBottom: '16px' }}
            />
            {videoFile && <p style={{ color: '#a78bfa', marginBottom: '16px', fontSize: '14px' }}>✅ {videoFile.name}</p>}
            <button
              onClick={handleVideoSummarize}
              disabled={!videoFile || loading}
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(to right, #7c3aed, #ec4899)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', opacity: (!videoFile || loading) ? 0.5 : 1 }}
            >
              {loading ? '⏳ Processing... this may take a few minutes' : 'Summarize Video'}
            </button>
          </div>
        ) : (
          <div>
            <h2 style={{ marginBottom: '16px' }}>YouTube Q&A</h2>
            {/* Step by step guide */}
<div style={{ marginBottom: '20px' }}>
  <p style={{ color: '#a78bfa', fontWeight: '600', marginBottom: '12px', fontSize: '14px' }}>How to get the YouTube URL:</p>
  
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {[
      { step: '1', text: 'Open the YouTube video you want to ask about' },
      { step: '2', text: 'Click the "Share" button below the video' },
      { step: '3', text: 'Click "Copy Link" to copy the URL' },
      { step: '4', text: 'Paste the URL in the field below' },
    ].map(({ step, text }) => (
      <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'linear-gradient(to right, #7c3aed, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '700', fontSize: '13px', flexShrink: 0
        }}>
          {step}
        </div>
        <p style={{ color: '#d1c8ff', fontSize: '13px', margin: 0 }}>{text}</p>
      </div>
    ))}
  </div>
</div>
            <input
              type="text"
              placeholder="Enter YouTube URL"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', marginBottom: '12px', outline: 'none' }}
            />
            <input
              type="text"
              placeholder="Ask a question about the video"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', marginBottom: '16px', outline: 'none' }}
            />
            <button
              onClick={handleYoutubeQna}
              disabled={!youtubeUrl || !query || loading}
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(to right, #7c3aed, #ec4899)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', opacity: (!youtubeUrl || !query || loading) ? 0.5 : 1 }}
            >
              {loading ? '⏳ Processing...' : 'Get Answer'}
            </button>
          </div>
        )}

        {error && (
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#ff6b6b' }}>
            ❌ {error}
          </div>
        )}
        {answer && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '8px', color: '#d1c8ff', lineHeight: '1.6' }}>
            <strong style={{ color: '#a78bfa' }}>Answer:</strong>
            <p style={{ marginTop: '8px' }}>{answer}</p>
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#6b5fa0' }}>
        ⚠️ Make sure the FastAPI server is running on port 8000
      </p>
    </div>
  );
};

export default VideoSummarizerPage;