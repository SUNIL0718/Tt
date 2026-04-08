"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ChevronRight,
  Download,
  History,
  Clock,
  AlertTriangle
} from "lucide-react";
import { bulkImportData, getImportHistory } from "@/actions/import-actions";
import { downloadTemplate, IMPORT_FORMATS } from "@/lib/export-utils";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "TEACHER" | "CLASS" | "SUBJECT" | "ROOM" | "DEPARTMENT";
  onComplete: () => void;
}

export default function ImportModal({ isOpen, onClose, entityType, onComplete }: ImportModalProps) {
  const [tab, setTab] = useState<"IMPORT" | "HISTORY">("IMPORT");
  const [step, setStep] = useState<"UPLOAD" | "PREVIEW" | "IMPORTING" | "SUMMARY">("UPLOAD");
  const [fileData, setFileData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<{ success: number; failed: number; total: number; errors?: any[] } | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = useCallback(async () => {
    const data = await getImportHistory(entityType);
    setHistory(data);
  }, [entityType]);

  useEffect(() => {
    if (isOpen && tab === "HISTORY") {
      fetchHistory();
    }
  }, [isOpen, tab, fetchHistory]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setFileData(data);
      setStep("PREVIEW");
      setIsProcessing(false);
    };
    reader.readAsBinaryString(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const handleImport = async () => {
    setStep("IMPORTING");
    try {
        // Sanitize data to ensure only plain objects are passed to server action
        const plainData = JSON.parse(JSON.stringify(fileData));
        const result = await bulkImportData(entityType, plainData, fileName);
        if (result.success && result.summary) {
            setImportSummary(result.summary);
            setStep("SUMMARY");
            onComplete();
        } else {
            alert(result.error || "Import failed");
            setStep("PREVIEW");
        }
    } catch (err: any) {
        alert(err.message);
        setStep("PREVIEW");
    }
  };

  const handleDownloadTemplate = () => downloadTemplate(entityType);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Import {entityType === "CLASS" ? "Classes" : `${entityType.charAt(0) + entityType.slice(1).toLowerCase()}s`}
              </h2>
              <p className="text-sm text-slate-500 mt-1">Bulk upload your data via Excel or CSV</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button 
                onClick={() => setTab("IMPORT")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === "IMPORT" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                <Upload className="h-4 w-4" />
                Import Now
            </button>
            <button 
                onClick={() => setTab("HISTORY")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === "HISTORY" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                <History className="h-4 w-4" />
                History
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "IMPORT" ? (
            <>
              {step === "UPLOAD" && (
                <div className="space-y-6">
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isDragActive ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="w-16 h-16 bg-indigo-100/50 rounded-full flex items-center justify-center mb-4">
                      <Upload className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Click to upload or drag & drop</h3>
                    <p className="text-sm text-slate-500 mt-1">Excel (.xlsx) or CSV files only</p>
                    {isProcessing && (
                      <div className="flex items-center gap-2 mt-4 text-indigo-600 font-medium">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Parsing file...
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border shadow-sm">
                        <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Need a template?</p>
                        <p className="text-xs text-slate-500">Download our formatted Excel template</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleDownloadTemplate}
                      className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>

                  {/* Format Guide */}
                  {IMPORT_FORMATS[entityType] && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Required Columns</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {IMPORT_FORMATS[entityType].map((col: any) => (
                           <div key={col.header} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                              <span className="text-xs font-bold text-slate-700">{col.header}</span>
                              <div className="flex items-center gap-1.5">
                                 {col.required && <span className="w-1.5 h-1.5 rounded-full bg-red-400" title="Required" />}
                                 <span className="text-[9px] text-slate-400">{col.desc}</span>
                              </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === "PREVIEW" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="text-indigo-600" />
                      <span className="font-bold text-indigo-900">{fileName}</span>
                      <span className="text-sm text-indigo-700 font-medium">({fileData.length} rows detected)</span>
                    </div>
                    <button onClick={() => setStep("UPLOAD")} className="text-sm font-bold text-indigo-600 hover:underline">
                      Change file
                    </button>
                  </div>

                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          {Object.keys(fileData[0] || {}).map((key) => (
                            <th key={key} className="px-4 py-3 font-bold text-slate-700 capitalize">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {fileData.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="px-4 py-3 text-slate-600">{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {fileData.length > 5 && (
                      <div className="p-3 text-center bg-slate-50 border-t text-xs text-slate-500 font-medium">
                        Showing first 5 rows of {fileData.length} records
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <AlertCircle className="h-4 w-4" />
                    Please verify the columns match our template before importing.
                  </div>
                </div>
              )}

              {step === "IMPORTING" && (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-900">Syncing with database</h3>
                    <p className="text-sm text-slate-500 animate-pulse">This may take a few moments...</p>
                  </div>
                </div>
              )}

              {step === "SUMMARY" && importSummary && (
                <div className="space-y-8 animate-in fade-in zoom-in duration-300">
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      {importSummary.failed > 0 ? (
                        <AlertTriangle className="h-10 w-10 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">
                        {importSummary.failed === 0 ? "Import Successful!" : "Import Completed with Issues"}
                    </h3>
                    <p className="text-slate-500 mt-1">Processed {importSummary.total} records</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border text-center">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total</p>
                      <p className="text-2xl font-bold text-slate-900">{importSummary.total}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                      <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Success</p>
                      <p className="text-2xl font-bold text-emerald-700">{importSummary.success}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                      <p className="text-xs text-red-600 font-bold uppercase mb-1">Failed</p>
                      <p className="text-2xl font-bold text-red-700">{importSummary.failed}</p>
                    </div>
                  </div>

                  {importSummary.errors && importSummary.errors.length > 0 && (
                    <div className="mt-6 space-y-3">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            Error Breakdown
                        </h4>
                        <div className="max-h-48 overflow-y-auto border rounded-xl divide-y">
                            {importSummary.errors.map((err, i) => (
                                <div key={i} className="p-3 text-sm flex gap-3">
                                    <span className="font-bold text-slate-400">Row {err.row}:</span>
                                    <span className="text-slate-600">{err.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Clock className="h-12 w-12 text-slate-200 mb-4" />
                        <p className="text-slate-500 font-medium">No import history found</p>
                    </div>
                ) : (
                    <div className="border rounded-xl divide-y">
                        {history.map((item) => (
                            <div key={item._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        item.status === "COMPLETED" ? "bg-emerald-100 text-emerald-600" : 
                                        item.status === "FAILED" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                                    }`}>
                                        <FileSpreadsheet className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{item.fileName}</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(item.createdAt).toLocaleString()} • {item.successCount}/{item.totalRows} success
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                    item.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : 
                                    item.status === "FAILED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                }`}>
                                    {item.status}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-slate-50/50 rounded-b-2xl flex justify-end gap-3">
          {tab === "IMPORT" && step === "PREVIEW" && (
            <>
              <button 
                onClick={() => setStep("UPLOAD")} 
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleImport}
                className="px-8 py-2.5 bg-indigo-600 rounded-xl text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                Confirm Import
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          {tab === "IMPORT" && step === "SUMMARY" && (
            <button 
              onClick={onClose}
              className="px-8 py-2.5 bg-slate-900 rounded-xl text-white font-bold hover:bg-slate-800 transition-all"
            >
              Close
            </button>
          )}
          {(tab === "HISTORY" || (tab === "IMPORT" && step === "UPLOAD")) && (
            <button 
              onClick={onClose} 
              className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
