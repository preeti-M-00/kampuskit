import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const FLASK_URL = import.meta.env.VITE_PDF_API_URL || "http://localhost:5000";

export default function PdfSummarizerPage() {
  const [file, setFile] = useState(null);
  const [length, setLength] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [entryId, setEntryId] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${FLASK_URL}/api/history`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history");
    }
  };

  const reset = () => {
    setFile(null);
    setSummary(null);
    setEntryId(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("length", length);

      const res = await fetch(`${FLASK_URL}/api/summarize`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Summarization failed");

      setSummary(data.summary);
      setEntryId(data.id);
      fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!entryId) return;
    try {
      const res = await fetch(`${FLASK_URL}/api/download/${entryId}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `summary.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Download failed");
    }
  };

  const handleDeleteHistory = async (id) => {
    await fetch(`${FLASK_URL}/api/history/${id}`, { method: "DELETE" });
    fetchHistory();
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #2a1b5e, #140a30)", color: "white", padding: "40px 20px" }}>
      
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>📄 PDF Summarizer</h1>
        <p style={{ color: "#d1c8ff" }}>Upload a PDF and get an AI-powered summary instantly</p>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto" }}>

        {/* History Toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{ marginBottom: "20px", padding: "8px 20px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "white", cursor: "pointer", fontSize: "13px" }}
        >
          {showHistory ? "Hide History" : "📋 View History"} ({history.length})
        </button>

        {/* History Panel */}
        {showHistory && (
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", marginBottom: "24px", maxHeight: "300px", overflowY: "auto" }}>
            {history.length === 0 ? (
              <p style={{ color: "#a78bfa", textAlign: "center" }}>No history yet</p>
            ) : (
              history.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}
                  onClick={() => { setSummary(item.summary); setEntryId(item.id); setShowHistory(false); }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>{item.filename}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#a78bfa" }}>{item.length_type} · {new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteHistory(item.id); }}
                    style={{ background: "rgba(255,100,100,0.2)", border: "none", color: "#ff6b6b", borderRadius: "8px", padding: "4px 10px", cursor: "pointer", fontSize: "12px" }}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Upload Panel */}
        {!summary && (
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "32px" }}>
            
            {/* File Upload */}
            <label style={{ display: "block", marginBottom: "20px", cursor: "pointer" }}>
              <div style={{ border: "2px dashed rgba(124,58,237,0.5)", borderRadius: "12px", padding: "40px", textAlign: "center", background: file ? "rgba(124,58,237,0.1)" : "transparent", transition: "0.3s" }}>
                {file ? (
                  <div>
                    <p style={{ fontSize: "24px", marginBottom: "8px" }}>✅</p>
                    <p style={{ color: "#a78bfa", fontWeight: "600" }}>{file.name}</p>
                    <p style={{ color: "#6b5fa0", fontSize: "12px" }}>{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: "40px", marginBottom: "8px" }}>📄</p>
                    <p style={{ color: "#d1c8ff" }}>Click to upload a PDF</p>
                    <p style={{ color: "#6b5fa0", fontSize: "12px" }}>Only PDF files supported</p>
                  </div>
                )}
              </div>
              <input type="file" accept=".pdf" hidden onChange={(e) => setFile(e.target.files[0])} />
            </label>

            {/* Length Selector */}
            <div style={{ marginBottom: "24px" }}>
              <p style={{ color: "#a78bfa", fontWeight: "600", marginBottom: "12px", fontSize: "14px" }}>SUMMARY LENGTH</p>
              <div style={{ display: "flex", gap: "10px" }}>
                {["short", "medium", "long"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLength(l)}
                    style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "13px", background: length === l ? "linear-gradient(to right, #7c3aed, #ec4899)" : "rgba(255,255,255,0.1)", color: "white", transition: "0.2s" }}
                  >
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                    <p style={{ margin: "4px 0 0", fontSize: "11px", fontWeight: "400", color: length === l ? "rgba(255,255,255,0.8)" : "#a78bfa" }}>
                      {l === "short" ? "Key points only" : l === "medium" ? "Balanced overview" : "Detailed summary"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ padding: "12px", background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.3)", borderRadius: "8px", color: "#ff6b6b", marginBottom: "16px" }}>
                ❌ {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!file || loading}
              style={{ width: "100%", padding: "14px", background: "linear-gradient(to right, #7c3aed, #ec4899)", border: "none", borderRadius: "10px", color: "white", fontWeight: "600", fontSize: "15px", cursor: file && !loading ? "pointer" : "not-allowed", opacity: !file || loading ? 0.6 : 1 }}
            >
              {loading ? "⏳ Summarizing..." : "✦ Summarize PDF"}
            </button>
          </div>
        )}

        {/* Summary Result */}
        {summary && (
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "20px" }}>📝 Summary</h2>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleDownload}
                  style={{ padding: "8px 18px", borderRadius: "10px", border: "none", background: "linear-gradient(to right, #7c3aed, #ec4899)", color: "white", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
                >
                  ⬇ Download PDF
                </button>
                <button
                  onClick={reset}
                  style={{ padding: "8px 18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "white", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
                >
                  + New
                </button>
              </div>
            </div>

            <div style={{ color: "#d1c8ff", lineHeight: "1.7" }}>
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}