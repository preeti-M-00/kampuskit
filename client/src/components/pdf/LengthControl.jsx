const OPTIONS = [
  { value: "short",  label: "Short",  desc: "Key points only" },
  { value: "medium", label: "Medium", desc: "Balanced overview" },
  { value: "long",   label: "Long",   desc: "Detailed summary" },
];

export default function LengthControl({ value, onChange }) {
  return (
    <div className="length-control">
      <p className="lc-label">Summary Length</p>
      <div className="lc-options">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`lc-btn ${value === opt.value ? "active" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            <span className="lc-name">{opt.label}</span>
            <span className="lc-desc">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
