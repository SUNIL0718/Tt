import * as XLSX from "xlsx";

export const TEMPLATES: Record<string, string[]> = {
  TEACHER: ["Name", "Email", "Initials", "Max Periods Per Week", "Department"],
  CLASS: ["Name", "Semester", "Department"],
  SUBJECT: ["Name", "Code", "Type (THEORY/LAB)", "Department"],
  ROOM: ["Name", "Capacity", "Type (CLASSROOM/LAB)"],
  DEPARTMENT: ["Name", "Code"],
};

export const downloadTemplate = (entityType: string) => {
  const headers = TEMPLATES[entityType] || [];
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, `${entityType.toLowerCase()}_template.xlsx`);
};

export const IMPORT_FORMATS = {
  TEACHER: [
    { header: "Name", required: true, desc: "Full Name" },
    { header: "Email", required: false, desc: "Email Address" },
    { header: "Initials", required: false, desc: "e.g. JD" },
    { header: "Dept", required: false, desc: "Department Name/Code" },
    { header: "MaxPeriods", required: false, desc: "Weekly Limit (default 30)" }
  ],
  CLASS: [
    { header: "Name", required: true, desc: "e.g. Class 10" },
    { header: "Semester", required: true, desc: "e.g. 1st or A" },
    { header: "Dept", required: false, desc: "Department Name/Code" }
  ],
  SUBJECT: [
    { header: "Name", required: true, desc: "Subject Name" },
    { header: "Code", required: false, desc: "Subject Code" },
    { header: "Type", required: false, desc: "THEORY or LAB" },
    { header: "Dept", required: false, desc: "Department Name/Code" }
  ],
  ROOM: [
    { header: "Name", required: true, desc: "Room Number/Name" },
    { header: "Capacity", required: false, desc: "Student Capacity" },
    { header: "Type", required: false, desc: "CLASSROOM or LAB" }
  ],
  DEPARTMENT: [
    { header: "Name", required: true, desc: "Department Name" },
    { header: "Code", required: false, desc: "Short Code (e.g. CSE)" }
  ]
};

