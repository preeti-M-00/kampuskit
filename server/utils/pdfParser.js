import fs from "fs/promises";
import PDFParser from "pdf2json";

export const extractTextFromPDF = async (filePathOrBuffer) => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataReady", (pdfData) => {
            const text = pdfData.Pages
                .map(page => page.Texts
                    .map(t => decodeURIComponent(t.R[0].T))
                    .join(" "))
                .join("\n");

            resolve({
                text,
                numPages: pdfData.Pages.length,
                info: {}
            });
        });

        pdfParser.on("pdfParser_dataError", (err) => {
            reject(new Error("Failed to extract text from PDF"));
        });

        if (Buffer.isBuffer(filePathOrBuffer)) {
            pdfParser.parseBuffer(filePathOrBuffer);
        } else {
            pdfParser.loadPDF(filePathOrBuffer);
        }
    });
};