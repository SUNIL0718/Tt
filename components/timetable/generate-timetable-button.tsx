"use client";

import { useState } from "react";
import { generateTimetableAction } from "@/actions/timetable";
import { Sparkles, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function GenerateTimetableButton() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

    async function handleGenerate(formData: FormData) {
        setLoading(true);
        setMessage(null);
        
        try {
            const result = await generateTimetableAction(formData);
            
            if (result.success) {
                setMessage({ text: result.message || "Success!", type: "success" });
            } else {
                setMessage({ text: result.message || "An error occurred.", type: "error" });
            }
        } catch (error) {
            setMessage({ text: "Failed to connect to server.", type: "error" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-end gap-3">
            <form action={handleGenerate} className="flex gap-2">
                <input 
                    type="hidden" 
                    name="name" 
                    value={`Draft ${new Date().toLocaleDateString()}`} 
                />
                <button 
                    type="submit"
                    disabled={loading}
                    className="group relative flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Sparkles className="w-5 h-5" />
                    )}
                    <span className="text-sm">{loading ? "Generating..." : "Generate Grid"}</span>
                </button>
            </form>

            {message && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider animate-in fade-in zoom-in duration-300 ${
                    message.type === "success" 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                    : "bg-red-50 text-red-600 border border-red-100"
                }`}>
                    {message.type === "success" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {message.text}
                </div>
            )}
        </div>
    );
}
