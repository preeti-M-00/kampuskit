import { useState, useEffect, useRef, useCallback } from 'react'
import {
  FileText, Upload, Zap, Clock, Download, Eye, Trash2,
  ChevronDown, ChevronUp, X, CheckCircle, AlertCircle,
  Sparkles, LayoutList, FileCheck
} from 'lucide-react'

// Get userId from URL params
// const params = new URLSearchParams(window.location.search);
// const USER_ID = params.get('userId') || 'default';

const API = ''

const LENGTH_OPTIONS = [
  {
    id: 'short',
    label: 'Short',
    desc: '150–250 words',
    icon: '⚡',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)'
  },
  {
    id: 'medium',
    label: 'Medium',
    desc: '400–600 words',
    icon: '✦',
    color: '#7c5cfc',
    glow: 'rgba(124,92,252,0.3)'
  },
  {
    id: 'long',
    label: 'Long',
    desc: '800–1200 words',
    icon: '◈',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.3)'
  }
]

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function SummaryModal({ entry, onClose, onDownload }) {
  const sections = []
  if (!entry) return null

  const lines = entry.summary.split('\n')
  let currentSection = null

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      if (currentSection) sections.push(currentSection)
      currentSection = { heading: trimmed.replace(/^#+\s*/, ''), content: [] }
    } else if (trimmed) {
      if (!currentSection) currentSection = { heading: null, content: [] }
      currentSection.content.push(trimmed)
    }
  })
  if (currentSection) sections.push(currentSection)

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.modalTitle}>{entry.filename}</div>
            <div style={styles.modalMeta}>
              <span style={{ ...styles.lengthBadge, background: LENGTH_OPTIONS.find(l => l.id === entry.length_type)?.glow, color: LENGTH_OPTIONS.find(l => l.id === entry.length_type)?.color }}>
                {entry.length_type}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(entry.timestamp)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>~{entry.word_count} words</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={styles.downloadBtn} onClick={() => onDownload(entry.id)}>
              <Download size={15} /> Download PDF
            </button>
            <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
          </div>
        </div>
        <div style={styles.modalBody}>
          {sections.map((section, idx) => (
            <div key={idx} style={styles.summarySection}>
              {section.heading && (
                <div style={styles.sectionHeading}>
                  <span style={styles.sectionDot} />
                  {section.heading}
                </div>
              )}
              {section.content.map((line, j) => {
                const isBullet = line.startsWith('- ') || line.startsWith('* ') || line.startsWith('•')
                const text = isBullet ? line.replace(/^[-*•]\s*/, '') : line
                return (
                  <p key={j} style={isBullet ? styles.bulletLine : styles.bodyLine}>
                    {isBullet && <span style={styles.bulletDot}>◆</span>}
                    {text}
                  </p>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HistoryItem({ entry, onView, onDownload, onDelete }) {
  const opt = LENGTH_OPTIONS.find(l => l.id === entry.length_type)
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={styles.historyItem}>
      <div style={styles.historyHeader}>
        <div style={styles.historyLeft}>
          <div style={{ ...styles.historyIcon, background: opt?.glow }}>
            <FileText size={16} color={opt?.color} />
          </div>
          <div>
            <div style={styles.historyFilename}>{entry.filename}</div>
            <div style={styles.historyMeta}>
              <span style={{ ...styles.lengthBadge, background: opt?.glow, color: opt?.color }}>{entry.length_type}</span>
              <span style={styles.historyDate}>{formatDate(entry.timestamp)}</span>
              <span style={styles.historyWords}>~{entry.word_count} words</span>
            </div>
          </div>
        </div>
        <div style={styles.historyActions}>
          <button style={styles.iconBtn} onClick={() => onView(entry)} title="View Summary">
            <Eye size={15} />
          </button>
          <button style={styles.iconBtn} onClick={() => onDownload(entry.id)} title="Download PDF">
            <Download size={15} />
          </button>
          <button style={{ ...styles.iconBtn, color: 'var(--error)' }} onClick={() => onDelete(entry.id)} title="Delete">
            <Trash2 size={15} />
          </button>
          <button style={styles.iconBtn} onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div style={styles.historyPreview}>
          {entry.summary.slice(0, 400)}...
        </div>
      )}
    </div>
  )
}

export default function App() {
  const USER_ID = new URLSearchParams(window.location.search).get('userId') || 'default';

  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [length, setLength] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('summarize')
  const [viewEntry, setViewEntry] = useState(null)
  const fileInputRef = useRef(null)

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/history?userId=${USER_ID}`)
      const data = await res.json()
      setHistory(data)
    } catch {}
}, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f)
      setError('')
      setResult(null)
    } else {
      setError('Please upload a valid PDF file.')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }

  const handleSubmit = async () => {
    if (!file) return setError('Please select a PDF file.')

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const form = new FormData()
      form.append('file', file)
      form.append('length', length)
      form.append('userId', USER_ID)

      const res = await fetch(`${API}/api/summarize`, { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Summarization failed')

      setResult(data)
      fetchHistory()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (id) => {
    const link = document.createElement('a')
    link.href = `${API}/api/download/${id}?userId=${USER_ID}`
    link.click()
}

  const handleDelete = async (id) => {
    await fetch(`${API}/api/history/${id}?userId=${USER_ID}`, { method: 'DELETE' })
    fetchHistory()
    if (result?.id === id) setResult(null)
}

  const opt = LENGTH_OPTIONS.find(l => l.id === length)

  return (
    <div style={styles.root}>
      <div className="noise-overlay" />

      {/* Stars background */}
      <div style={styles.stars}>
        {[...Array(30)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 2 + 1 + 'px',
            height: Math.random() * 2 + 1 + 'px',
            background: 'white',
            borderRadius: '50%',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5 + 0.1,
            animation: `twinkle ${Math.random() * 3 + 2}s infinite alternate`
          }} />
        ))}
      </div>

      <style>{`
        @keyframes twinkle { from { opacity: 0.1; } to { opacity: 0.6; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(124,92,252,0.4); } 50% { box-shadow: 0 0 0 8px rgba(124,92,252,0); } }
      `}</style>

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}><Sparkles size={20} color="#7c5cfc" /></div>
            <span style={styles.logoText}>SummarizeAI</span>
          </div>
        </header>

        {/* Hero */}
        <div style={styles.hero}>
          <div style={styles.heroTag}><Zap size={12} /> Powered by Groq LLM</div>
          <h1 style={styles.heroTitle}>Summarize Any PDF<br /><span style={styles.heroAccent}>Instantly</span></h1>
          <p style={styles.heroSub}>Upload your PDF, choose a summary length, and get structured insights in seconds.</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(activeTab === 'summarize' ? styles.activeTab : {}) }} onClick={() => setActiveTab('summarize')}>
            <FileText size={15} /> Summarize
          </button>
          <button style={{ ...styles.tab, ...(activeTab === 'history' ? styles.activeTab : {}) }} onClick={() => { setActiveTab('history'); fetchHistory() }}>
            <Clock size={15} /> History
            {history.length > 0 && <span style={styles.badge}>{history.length}</span>}
          </button>
        </div>

        {activeTab === 'summarize' ? (
          <div style={styles.mainCard}>
            {/* Upload Zone */}
            <div
              style={{ ...styles.dropzone, ...(dragOver ? styles.dropzoneActive : {}), ...(file ? styles.dropzoneHasFile : {}) }}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              {file ? (
                <div style={styles.fileInfo}>
                  <FileCheck size={32} color="#4ade80" />
                  <div>
                    <div style={styles.fileName}>{file.name}</div>
                    <div style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button style={styles.removeFile} onClick={e => { e.stopPropagation(); setFile(null) }}><X size={14} /></button>
                </div>
              ) : (
                <div style={styles.dropContent}>
                  <div style={styles.uploadIcon}><Upload size={28} color="var(--accent)" /></div>
                  <div style={styles.dropTitle}>Drop your PDF here</div>
                  <div style={styles.dropSub}>or click to browse</div>
                </div>
              )}
            </div>

            {/* Length Selector */}
            <div style={styles.sectionLabel}>Summary Length</div>
            <div style={styles.lengthGrid}>
              {LENGTH_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  style={{
                    ...styles.lengthCard,
                    ...(length === opt.id ? { ...styles.lengthCardActive, borderColor: opt.color, boxShadow: `0 0 20px ${opt.glow}` } : {})
                  }}
                  onClick={() => setLength(opt.id)}
                >
                  <span style={styles.lengthIcon}>{opt.icon}</span>
                  <span style={{ ...styles.lengthLabel, color: length === opt.id ? opt.color : 'var(--text-primary)' }}>{opt.label}</span>
                  <span style={styles.lengthDesc}>{opt.desc}</span>
                  {length === opt.id && <div style={{ ...styles.lengthIndicator, background: opt.color }} />}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={styles.errorBox}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {/* Submit */}
            <button style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnLoading : {}) }} onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <div style={styles.spinner} />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Summary
                </>
              )}
            </button>

            {/* Result */}
            {result && (
              <div style={styles.resultCard}>
                <div style={styles.resultHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={18} color="var(--success)" />
                    <span style={styles.resultTitle}>Summary Ready</span>
                    <span style={{ ...styles.lengthBadge, background: opt?.glow, color: opt?.color }}>{result.length_type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={styles.viewBtn} onClick={() => setViewEntry(history.find(h => h.id === result.id) || result)}>
                      <Eye size={14} /> View
                    </button>
                    <button style={styles.downloadResultBtn} onClick={() => handleDownload(result.id)}>
                      <Download size={14} /> Download PDF
                    </button>
                  </div>
                </div>
                <div style={styles.resultPreview}>
                  {result.summary.slice(0, 500)}...
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.historyContainer}>
            {history.length === 0 ? (
              <div style={styles.emptyState}>
                <LayoutList size={40} color="var(--text-muted)" />
                <div style={{ color: 'var(--text-muted)', marginTop: 12 }}>No summaries yet</div>
              </div>
            ) : (
              <>
                <div style={styles.historyCount}>{history.length} summary{history.length !== 1 ? 's' : ''}</div>
                {history.map(entry => (
                  <HistoryItem
                    key={entry.id}
                    entry={entry}
                    onView={setViewEntry}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {viewEntry && (
        <SummaryModal
          entry={viewEntry}
          onClose={() => setViewEntry(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  )
}

const styles = {
  root: {
    minHeight: '100vh',
    position: 'relative',
    overflowX: 'hidden',
  },
  stars: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  container: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '0 20px 60px',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 0 20px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'rgba(124,92,252,0.15)',
    border: '1px solid rgba(124,92,252,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    fontSize: 18,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  },
  keyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-secondary)',
    padding: '7px 14px',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  keyPanel: {
    marginBottom: 20,
    animation: 'fadeIn 0.2s ease',
  },
  keyPanelInner: {
    background: 'rgba(124,92,252,0.08)',
    border: '1px solid var(--border-accent)',
    borderRadius: 12,
    padding: '16px 20px',
  },
  keyInput: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    padding: '8px 12px',
    fontSize: 13,
    outline: 'none',
    fontFamily: 'monospace',
  },
  saveKeyBtn: {
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 8,
    color: 'white',
    padding: '8px 16px',
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: 600,
  },
  hero: {
    textAlign: 'center',
    padding: '40px 0 32px',
  },
  heroTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(124,92,252,0.12)',
    border: '1px solid rgba(124,92,252,0.25)',
    borderRadius: 20,
    padding: '5px 14px',
    fontSize: 12,
    color: 'var(--accent-light)',
    letterSpacing: '0.05em',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 48,
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    marginBottom: 16,
    color: 'var(--text-primary)',
  },
  heroAccent: {
    background: 'linear-gradient(135deg, #a78bfa, #7c5cfc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    color: 'var(--text-secondary)',
    fontSize: 16,
    maxWidth: 440,
    margin: '0 auto',
  },
  tabs: {
    display: 'flex',
    gap: 4,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: '10px',
    borderRadius: 9,
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'DM Sans, sans-serif',
  },
  activeTab: {
    background: 'rgba(124,92,252,0.2)',
    color: 'var(--accent-light)',
    border: '1px solid rgba(124,92,252,0.3)',
  },
  badge: {
    background: 'var(--accent)',
    color: 'white',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    padding: '1px 6px',
    minWidth: 18,
    textAlign: 'center',
  },
  mainCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: 28,
    animation: 'fadeIn 0.3s ease',
  },
  dropzone: {
    border: '2px dashed var(--border)',
    borderRadius: 14,
    padding: '36px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: 28,
    background: 'var(--surface)',
  },
  dropzoneActive: {
    borderColor: 'var(--accent)',
    background: 'rgba(124,92,252,0.08)',
  },
  dropzoneHasFile: {
    borderColor: '#4ade80',
    borderStyle: 'solid',
    background: 'rgba(74,222,128,0.05)',
  },
  dropContent: {},
  uploadIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    background: 'rgba(124,92,252,0.12)',
    border: '1px solid rgba(124,92,252,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px',
  },
  dropTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 4,
  },
  dropSub: {
    color: 'var(--text-muted)',
    fontSize: 13,
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    justifyContent: 'center',
  },
  fileName: {
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontSize: 15,
  },
  fileSize: {
    color: 'var(--text-muted)',
    fontSize: 12,
  },
  removeFile: {
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.3)',
    borderRadius: 6,
    color: 'var(--error)',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 12,
  },
  lengthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    marginBottom: 24,
  },
  lengthCard: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '18px 12px',
    borderRadius: 14,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    overflow: 'hidden',
    fontFamily: 'DM Sans, sans-serif',
  },
  lengthCardActive: {
    background: 'rgba(124,92,252,0.08)',
  },
  lengthIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  lengthLabel: {
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    fontSize: 15,
  },
  lengthDesc: {
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  lengthIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: '0 0 14px 14px',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.3)',
    borderRadius: 10,
    padding: '12px 16px',
    color: 'var(--error)',
    fontSize: 13,
    marginBottom: 16,
  },
  submitBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: 'linear-gradient(135deg, #7c5cfc, #5b3fd4)',
    border: 'none',
    borderRadius: 14,
    color: 'white',
    padding: '16px',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'Syne, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 8px 30px rgba(124,92,252,0.3)',
    animation: 'pulse 2s infinite',
  },
  submitBtnLoading: {
    opacity: 0.7,
    cursor: 'not-allowed',
    animation: 'none',
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  resultCard: {
    marginTop: 20,
    background: 'rgba(74,222,128,0.05)',
    border: '1px solid rgba(74,222,128,0.2)',
    borderRadius: 14,
    padding: 20,
    animation: 'fadeIn 0.4s ease',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 10,
  },
  resultTitle: {
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    fontSize: 15,
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    padding: '7px 12px',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  downloadResultBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: 'rgba(124,92,252,0.2)',
    border: '1px solid rgba(124,92,252,0.4)',
    borderRadius: 8,
    color: 'var(--accent-light)',
    padding: '7px 12px',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  resultPreview: {
    color: 'var(--text-secondary)',
    fontSize: 13,
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
  },
  lengthBadge: {
    padding: '2px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  historyContainer: {
    animation: 'fadeIn 0.3s ease',
  },
  historyCount: {
    fontSize: 12,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 12,
    fontWeight: 600,
  },
  historyItem: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '16px 18px',
    marginBottom: 10,
    transition: 'border-color 0.2s',
  },
  historyHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  historyLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  historyFilename: {
    fontWeight: 600,
    fontSize: 14,
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  historyMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 3,
  },
  historyDate: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  historyWords: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  historyActions: {
    display: 'flex',
    gap: 4,
    flexShrink: 0,
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'DM Sans, sans-serif',
  },
  historyPreview: {
    marginTop: 14,
    paddingTop: 14,
    borderTop: '1px solid var(--border)',
    color: 'var(--text-muted)',
    fontSize: 13,
    lineHeight: 1.65,
    whiteSpace: 'pre-wrap',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    color: 'var(--text-muted)',
    fontSize: 14,
  },
  // Modal styles
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10,5,30,0.85)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '40px 20px',
    overflowY: 'auto',
  },
  modal: {
    background: 'linear-gradient(135deg, #1e1045, #140a30)',
    border: '1px solid rgba(124,92,252,0.3)',
    borderRadius: 20,
    width: '100%',
    maxWidth: 680,
    boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
    animation: 'fadeIn 0.3s ease',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '24px 28px 20px',
    borderBottom: '1px solid var(--border)',
    gap: 16,
    flexWrap: 'wrap',
  },
  modalTitle: {
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    fontSize: 17,
    color: 'var(--text-primary)',
    marginBottom: 8,
  },
  modalMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  downloadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(124,92,252,0.2)',
    border: '1px solid rgba(124,92,252,0.4)',
    borderRadius: 8,
    color: 'var(--accent-light)',
    padding: '8px 14px',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 500,
  },
  closeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '24px 28px',
    maxHeight: '65vh',
    overflowY: 'auto',
  },
  summarySection: {
    marginBottom: 24,
  },
  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: 'Syne, sans-serif',
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--accent-light)',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1px solid rgba(124,92,252,0.15)',
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--accent)',
    flexShrink: 0,
  },
  bodyLine: {
    color: 'var(--text-secondary)',
    fontSize: 14,
    lineHeight: 1.75,
    marginBottom: 8,
  },
  bulletLine: {
    color: 'var(--text-secondary)',
    fontSize: 14,
    lineHeight: 1.7,
    marginBottom: 6,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 4,
  },
  bulletDot: {
    color: 'var(--accent)',
    fontSize: 10,
    marginTop: 5,
    flexShrink: 0,
  },
}
