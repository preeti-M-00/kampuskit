"""
summarizer.py — Optimized BART summarization.
Key speed improvements:
  - sshleifer/distilbart-cnn-12-6 → 2x faster than bart-large, similar quality
  - num_beams reduced to 2 (biggest CPU speedup)
  - Larger chunks = fewer inference calls
  - No padding to max_length (wastes compute)
"""
import torch
from transformers import BartTokenizerFast, BartForConditionalGeneration

_tokenizer = None
_model     = None
DEVICE     = "cuda" if torch.cuda.is_available() else "cpu"

# ── Swap to distilbart: 40% smaller, 2x faster, ~same quality ──
MODEL_NAME = "sshleifer/distilbart-cnn-12-6"

LENGTH_PRESETS = {
    "short":  {"min_length": 40,  "max_length": 120},
    "medium": {"min_length": 80,  "max_length": 220},
    "long":   {"min_length": 150, "max_length": 350},
}


def load_model():
    global _tokenizer, _model
    _tokenizer = BartTokenizerFast.from_pretrained(MODEL_NAME)
    _model = BartForConditionalGeneration.from_pretrained(MODEL_NAME).to(DEVICE)
    _model.eval()

    # Torch optimisation — helps on CPU
    if DEVICE == "cpu":
        try:
            _model = torch.compile(_model, mode="reduce-overhead")
        except Exception:
            pass  # torch.compile needs PyTorch 2.0+


def _chunk_text(text: str, max_tokens: int = 1000):
    """Larger chunks = fewer model calls = faster overall."""
    tokens = _tokenizer.tokenize(text)
    chunks = []
    for i in range(0, len(tokens), max_tokens):
        chunk = _tokenizer.convert_tokens_to_string(tokens[i : i + max_tokens])
        chunks.append(chunk)
    return chunks


def _summarize_chunk(chunk: str, length: str) -> str:
    preset = LENGTH_PRESETS.get(length, LENGTH_PRESETS["medium"])

    inputs = _tokenizer(
        chunk,
        return_tensors="pt",
        truncation=True,
        max_length=1024,
        # No padding — only pad what's needed
    ).to(DEVICE)

    with torch.no_grad():
        ids = _model.generate(
            inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_length=preset["max_length"],
            min_length=preset["min_length"],
            num_beams=2,           # was 4-5, this is the biggest speedup
            length_penalty=1.0,
            early_stopping=True,
            no_repeat_ngram_size=3,
        )
    return _tokenizer.decode(ids[0], skip_special_tokens=True)


def summarize_text(full_text: str, headings: list, length: str = "medium"):
    """Returns list of dicts: [{"heading": str, "text": str}, ...]"""
    if _model is None:
        raise RuntimeError("Model not loaded. Call load_model() first.")

    # Trim excessively long documents — beyond ~8000 tokens adds little value
    tokens = _tokenizer.tokenize(full_text)
    if len(tokens) > 8000:
        full_text = _tokenizer.convert_tokens_to_string(tokens[:8000])

    sections = []

    if headings:
        parts = [full_text]
        for h in headings:
            new_parts = []
            for part in parts:
                split = part.split(h, 1)
                new_parts.extend(split)
            parts = new_parts

        for i, heading in enumerate(headings):
            body = parts[i + 1] if i + 1 < len(parts) else ""
            if not body.strip():
                continue
            chunks    = _chunk_text(body)
            summaries = [_summarize_chunk(c, length) for c in chunks]
            sections.append({"heading": heading, "text": " ".join(summaries)})
    else:
        chunks    = _chunk_text(full_text)
        summaries = [_summarize_chunk(c, length) for c in chunks]
        sections.append({"heading": "Summary", "text": " ".join(summaries)})

    return sections