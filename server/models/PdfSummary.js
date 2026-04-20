import mongoose from "mongoose";

const PdfSummarySchema = new mongoose.Schema(
  {
    originalFileName: { type: String, required: true, trim: true },
    originalFileSize: { type: Number, required: true },
    summaryFileName:  { type: String, required: true, trim: true },
    summaryLength:    { type: String, enum: ["short", "medium", "long"], default: "medium" },
    // Sections: [{ heading, text }]
    sections: [
      {
        heading: { type: String, default: "" },
        text:    { type: String, default: "" },
      },
    ],
    pageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("PdfSummary", PdfSummarySchema);
