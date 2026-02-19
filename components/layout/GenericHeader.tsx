"use client";

import React, { useState } from "react";
import ImportModal from "@/components/layout/ImportModal";
import { Upload, Plus, Download } from "lucide-react";
import { downloadTemplate } from "@/lib/export-utils";

interface GenericHeaderProps {
  title: string;
  subtitle: string;
  entityType: "TEACHER" | "CLASS" | "SUBJECT" | "ROOM" | "DEPARTMENT";
  AddModal: React.ComponentType<any>;
  addModalProps?: any;
}

export default function GenericHeader({ title, subtitle, entityType, AddModal, addModalProps }: GenericHeaderProps) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const handleDownloadFormat = () => downloadTemplate(entityType);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-slate-500 font-medium">{subtitle}</p>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={handleDownloadFormat}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-sm font-bold text-indigo-700 hover:bg-indigo-100 transition-all shadow-sm"
          title="Download Sample Excel Format"
        >
          <Download className="h-4 w-4" />
          Download Demo
        </button>

        <button 
          onClick={() => setIsImportOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Upload className="h-4 w-4 text-indigo-600" />
          Import Excel
        </button>
        
        <AddModal {...addModalProps} />

        <ImportModal 
          isOpen={isImportOpen} 
          onClose={() => setIsImportOpen(false)} 
          entityType={entityType} 
          onComplete={() => {}} 
        />
      </div>
    </div>
  );
}
