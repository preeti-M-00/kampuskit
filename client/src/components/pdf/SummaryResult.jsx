export default function SummaryResult({ sections, pdfBlob, fileName, onToast }) {
  const handleCopy = async () => {
    const text = sections.map((s) => `${s.heading}\n${s.text}`).join("\n\n");
    await navigator.clipboard.writeText(text);
    onToast("Copied to clipboard!", "success");
  };

  const handleDownload = () => {
    const url = window.URL.createObjectURL(pdfBlob);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = `summary-${fileName}`;
    a.click();
    window.URL.revokeObjectURL(url);
    onToast("Downloading summary PDF…", "info");
  };

  return (
    <div className="summary-result">
      {/* Toolbar */}
      <div className="sr-toolbar">
        <h2 className="sr-title">Summary</h2>
        <div className="sr-actions">
          <button className="sr-btn" onClick={handleCopy} title="Copy to clipboard">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="5" y="5" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-7A1.5 1.5 0 001 3.5v8A1.5 1.5 0 002.5 13H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Copy
          </button>
          <button className="sr-btn accent" onClick={handleDownload} title="Download PDF">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="sr-body">
        {sections.map((sec, i) => (
          <div key={i} className="sr-section">
            {sec.heading && <h3 className="sr-heading">{sec.heading}</h3>}
            <p className="sr-text">{sec.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
