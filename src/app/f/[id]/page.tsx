"use client";

import React, { useEffect, useState } from "react";
import {
    Send,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Loader2,
    Lock,
    Globe,
    ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface FormField {
    id: string;
    label: string;
    type: string;
    placeholder: string;
    required: boolean;
    options: string[];
}

interface FormData {
    id: string;
    title: string;
    description: string;
    isPublished: boolean;
    fields: FormField[];
}

export default function PublicFormPage() {
    const params = useParams();
    const router = useRouter();
    const [form, setForm] = useState<FormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [values, setValues] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await fetch(`/api/crm/forms/${params.id}`);
                const data = await res.json();
                if (data.form) {
                    setForm(data.form);
                } else {
                    toast.error("Form not found");
                }
            } catch (err) {
                toast.error("Connection failed");
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: Record<string, string> = {};
        form?.fields.forEach(f => {
            if (f.required && !values[f.id]) {
                newErrors[f.id] = "This field is required";
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/crm/forms/${params.id}/responses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ values }),
            });
            if (res.ok) {
                setSubmitted(true);
                toast.success("Response Submitted!");
            } else {
                toast.error("Submission failed");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Link Initializing...</p>
        </div>
    );

    if (!form) return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
            <div className="w-24 h-24 bg-rose-50 rounded-[40px] flex items-center justify-center mb-8 border border-rose-100">
                <Lock size={48} className="text-rose-400" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Form Not Available</h1>
            <p className="text-slate-400 font-bold mt-2 text-center max-w-sm">This link is either broken or the administrator has removed this form.</p>
        </div>
    );

    if (submitted) return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-12 rounded-[50px] shadow-2xl border-4 border-white text-center max-w-[600px] w-full"
            >
                <div className="w-24 h-24 bg-emerald-50 rounded-[40px] flex items-center justify-center mx-auto mb-10 border border-emerald-100 shadow-xl shadow-emerald-50">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4">Transmission Successful</h1>
                <p className="text-slate-400 font-bold text-lg leading-relaxed mb-12">Your data has been securely logged into the CRM matrix. The administrator will review it shortly.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-12 py-5 bg-slate-900 text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl"
                >
                    Submit Another Response
                </button>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] py-20 px-6">
            {/* Security Badge */}
            <div className="max-w-[800px] mx-auto mb-12 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <ShieldCheck size={14} className="text-emerald-500" /> Encrypted Connection
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <Globe size={14} className="text-indigo-500" /> Public Access Live
                </div>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-[800px] mx-auto bg-white rounded-[60px] shadow-[0_50px_100px_rgba(0,0,0,0.05)] border-4 border-white overflow-hidden"
            >
                {/* Visual Header Banner */}
                <div className="h-40 bg-indigo-600 relative overflow-hidden flex items-center px-12 md:px-20">
                    <div className="absolute top-0 right-0 p-8 transform rotate-12 opacity-10">
                        <Send size={200} className="text-white" />
                    </div>
                    <div className="relative z-10 w-full">
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{form.title}</h1>
                    </div>
                </div>

                <div className="p-12 md:p-20">
                    <p className="text-slate-400 font-bold text-lg leading-relaxed mb-16 border-l-8 border-indigo-50 pl-8">
                        {form.description || "Please complete the information requested below. Your submission is handled through our secure corporate network."}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {form.fields.map((field) => (
                            <div key={field.id} className="space-y-4">
                                <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                                    {field.label} {field.required && <span className="text-rose-500 font-black">*</span>}
                                </label>

                                {field.type === "dropdown" ? (
                                    <div className="relative">
                                        <select
                                            value={values[field.id] || ""}
                                            onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                                            className={`w-full p-6 bg-slate-50 border-2 rounded-[30px] font-bold text-slate-700 outline-none transition-all appearance-none cursor-pointer
                                                ${errors[field.id] ? 'border-rose-100 bg-rose-50' : 'border-transparent focus:border-indigo-600 focus:bg-white'}`}
                                        >
                                            <option value="">{field.placeholder || "Please select an option..."}</option>
                                            {field.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                        </select>
                                        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                            <ArrowRight size={20} className="rotate-90" />
                                        </div>
                                    </div>
                                ) : field.type === "textarea" ? (
                                    <textarea
                                        placeholder={field.placeholder}
                                        value={values[field.id] || ""}
                                        onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                                        className={`w-full p-8 bg-slate-50 border-2 rounded-[40px] font-bold text-slate-700 outline-none transition-all min-h-[160px] resize-none
                                            ${errors[field.id] ? 'border-rose-100 bg-rose-50' : 'border-transparent focus:border-indigo-600 focus:bg-white'}`}
                                    />
                                ) : (
                                    <input
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={values[field.id] || ""}
                                        onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                                        className={`w-full p-6 bg-slate-50 border-2 rounded-[30px] font-bold text-slate-700 outline-none transition-all
                                            ${errors[field.id] ? 'border-rose-100 bg-rose-50' : 'border-transparent focus:border-indigo-600 focus:bg-white'}`}
                                    />
                                )}

                                <AnimatePresence>
                                    {errors[field.id] && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-50/50 px-4 py-2 rounded-xl border border-rose-50 w-fit ml-2"
                                        >
                                            <AlertCircle size={14} /> {errors[field.id]}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}

                        <div className="pt-12">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-6 md:py-8 bg-slate-900 text-white rounded-[40px] text-sm md:text-base font-black uppercase tracking-[0.3em] hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50 disabled:scale-100"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} /> Processing Data
                                    </>
                                ) : (
                                    <>
                                        Finalize Transmission <ArrowRight size={24} />
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest mt-8">
                                Secure Submission Powered by msteamMAGIC CRM Core
                            </p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
