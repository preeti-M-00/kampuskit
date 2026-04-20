import { useRef, useCallback, useState } from "react";

export default function UploadZone({ file, onFile, onRemove }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    if (f?.type === "application/pdf") onFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const fmt = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  };

  return (
    <div
      className={`upload-zone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onClick={() => !file && inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {!file ? (
        <div className="uz-empty">
          <div className="uz-icon">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <rect x="8" y="4" width="22" height="30" rx="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M22 4v10h8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M30 22v12M24 28l6-6 6 6" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="uz-label">Drop your PDF here</p>
          <p className="uz-hint">or <span className="uz-link">browse files</span></p>
          <p className="uz-badge">PDF only · up to 50 MB</p>
        </div>
      ) : (
        <div className="uz-file">
          <div className="uz-file-icon">
            <svg width="30" height="36" viewBox="0 0 30 36" fill="none">
              <rect x="1" y="1" width="28" height="34" rx="3" stroke="var(--accent)" strokeWidth="1.5"/>
              <path d="M7 10h12M7 15h12M7 20h8" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M19 6v8h8" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="uz-file-meta">
            <span className="uz-file-name">{file.name}</span>
            <span className="uz-file-size">{fmt(file.size)}</span>
          </div>
          <button className="uz-remove" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
