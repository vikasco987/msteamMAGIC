"use client";

import React, { useState } from "react";
import {
    Plus,
    Trash2,
    Settings,
    Save,
    ChevronLeft,
    GripVertical,
    Type,
    Hash,
    Calendar,
    CheckSquare,
    ChevronDown,
    AlignLeft,
    Phone,
    Mail,
    Image as ImageIcon,
    Layout,
    Eye,
    Rocket
} from "lucide-react";
import { motion, Reorder } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type FieldType = "text" | "number" | "date" | "dropdown" | "checkbox" | "textarea" | "phone" | "email" | "file";

interface FormField {
    id: string;
    label: string;
    type: FieldType;
    placeholder: string;
    required: boolean;
    options: string[];
}

export default function FormBuilderPage() {
    const router = useRouter();
    const [title, setTitle] = useState("Untitled Form");
    const [description, setDescription] = useState("");
    const [fields, setFields] = useState<FormField[]>([]);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const addField = (type: FieldType) => {
        const newField: FormField = {
            id: Math.random().toString(36).substr(2, 9),
            label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
            type,
            placeholder: "",
            required: false,
            options: type === "dropdown" ? ["Option 1"] : []
        };
        setFields([...fields, newField]);
        setSelectedFieldId(newField.id);
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
        if (selectedFieldId === id) setSelectedFieldId(null);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleSave = async (publish: boolean = false) => {
        if (!title.trim()) {
            toast.error("Please enter a form title");
            return;
        }
        setIsSaving(true);
        try {
            const res = await fetch("/api/crm/forms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    fields,
                    isPublished: publish
                }),
            });
            if (res.ok) {
                toast.success(publish ? "Form Published!" : "Form Saved!");
                router.push("/crm/forms");
            } else {
                toast.error("Failed to save form");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setIsSaving(false);
        }
    };

    const selectedField = fields.find(f => f.id === selectedFieldId);

    const fieldTypes: { type: FieldType; label: string; icon: any }[] = [
        { type: "text", label: "Short Text", icon: Type },
        { type: "textarea", label: "Long Text", icon: AlignLeft },
        { type: "number", label: "Number", icon: Hash },
        { type: "date", label: "Date Picker", icon: Calendar },
        { type: "dropdown", label: "Dropdown", icon: ChevronDown },
        { type: "checkbox", label: "Checkbox", icon: CheckSquare },
        { type: "phone", label: "Phone", icon: Phone },
        { type: "email", label: "Email", icon: Mail },
        { type: "file", label: "File Upload", icon: ImageIcon },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col h-screen overflow-hidden">
            {/* Top Bar */}
            <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                        <ChevronLeft size={20} className="text-slate-500" />
                    </button>
                    <div>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-xl font-black text-slate-900 bg-transparent border-none focus:ring-0 p-0"
                            placeholder="Enter Form Title..."
                        />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Form Builder Mode</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => handleSave(false)} disabled={isSaving} className="px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all">
                        {isSaving ? "Saving..." : "Save Draft"}
                    </button>
                    <button onClick={() => handleSave(true)} disabled={isSaving} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center gap-2">
                        <Rocket size={16} /> Publish Form
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Field Types */}
                <aside className="w-[300px] bg-white border-r border-slate-200 p-6 overflow-y-auto">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Field Inventory</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {fieldTypes.map((ft) => (
                            <button
                                key={ft.type}
                                onClick={() => addField(ft.type)}
                                className="flex items-center gap-4 p-4 bg-slate-50 border-2 border-transparent hover:border-indigo-600 hover:bg-white rounded-[20px] transition-all group"
                            >
                                <div className="p-2 bg-white group-hover:bg-indigo-50 rounded-xl shadow-sm group-hover:text-indigo-600 transition-colors">
                                    <ft.icon size={18} />
                                </div>
                                <span className="text-sm font-bold text-slate-700">{ft.label}</span>
                                <Plus size={16} className="ml-auto text-slate-300 group-hover:text-indigo-600" />
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Center: Live Preview Area */}
                <section className="flex-1 bg-slate-50 p-12 overflow-y-auto">
                    <div className="max-w-[700px] mx-auto space-y-6">
                        {/* Form Header Card */}
                        <div className="bg-white p-10 rounded-[32px] border-2 border-white shadow-xl">
                            <h2 className="text-3xl font-black text-slate-900 mb-4">{title || "Untitled Form"}</h2>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a description for your team or customers..."
                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-500 font-medium leading-relaxed resize-none"
                                rows={2}
                            />
                        </div>

                        {/* Fields Container */}
                        <Reorder.Group axis="y" values={fields} onReorder={setFields} className="space-y-4">
                            {fields.map((field) => (
                                <Reorder.Item
                                    key={field.id}
                                    value={field}
                                    onClick={() => setSelectedFieldId(field.id)}
                                    className={`bg-white p-8 rounded-[32px] border-2 transition-all cursor-pointer group relative
                                        ${selectedFieldId === field.id ? 'border-indigo-600 shadow-2xl' : 'border-transparent shadow-sm hover:shadow-md'}`}
                                >
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing">
                                        <GripVertical size={24} />
                                    </div>

                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">{field.type}</span>
                                            <h4 className="text-lg font-black text-slate-900 mt-2">{field.label} {field.required && <span className="text-rose-500">*</span>}</h4>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                                            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {/* Dummy Inputs for Preview */}
                                    {field.type === "text" && <div className="w-full h-14 bg-slate-50 rounded-2xl border border-slate-100 border-dashed" />}
                                    {field.type === "textarea" && <div className="w-full h-32 bg-slate-50 rounded-2xl border border-slate-100 border-dashed" />}
                                    {field.type === "dropdown" && (
                                        <div className="w-full h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center px-6 justify-between text-slate-400">
                                            Select an option... <ChevronDown size={18} />
                                        </div>
                                    )}
                                    {(field.type === "phone" || field.type === "number" || field.type === "email" || field.type === "date") && (
                                        <div className="w-full h-14 bg-slate-50 rounded-2xl border border-slate-100 border-dashed" />
                                    )}
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>

                        {fields.length === 0 && (
                            <div className="py-24 text-center border-4 border-dashed border-slate-200 rounded-[40px] bg-white/50">
                                <Layout size={60} className="mx-auto text-slate-200 mb-6" />
                                <h3 className="text-xl font-black text-slate-900">Your Canvas is Ready</h3>
                                <p className="text-slate-400 font-bold text-sm mt-2">Pick a field from the left sidebar to start building.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Right Sidebar: Field Settings */}
                <aside className="w-[350px] bg-white border-l border-slate-200 p-8 overflow-y-auto">
                    {selectedField ? (
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 mb-8">
                                <Settings className="text-indigo-600" size={20} />
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Field Configuration</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Label</label>
                                    <input
                                        type="text"
                                        value={selectedField.label}
                                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold text-slate-700 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Placeholder Message</label>
                                    <input
                                        type="text"
                                        value={selectedField.placeholder}
                                        onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold text-slate-700 outline-none transition-all"
                                    />
                                </div>

                                {selectedField.type === "dropdown" && (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dropdown Options</label>
                                        {selectedField.options.map((opt, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const newOpts = [...selectedField.options];
                                                        newOpts[idx] = e.target.value;
                                                        updateField(selectedField.id, { options: newOpts });
                                                    }}
                                                    className="flex-1 p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl font-bold text-slate-700 outline-none transition-all"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newOpts = selectedField.options.filter((_, i) => i !== idx);
                                                        updateField(selectedField.id, { options: newOpts });
                                                    }}
                                                    className="p-4 text-rose-500 hover:bg-rose-50 rounded-2xl"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => updateField(selectedField.id, { options: [...selectedField.options, `Option ${selectedField.options.length + 1}`] })}
                                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                                        >
                                            Add Option
                                        </button>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-700">Required Field</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Make this input mandatory</span>
                                        </div>
                                        <button
                                            onClick={() => updateField(selectedField.id, { required: !selectedField.required })}
                                            className={`w-14 h-8 rounded-full relative transition-all duration-300 
                                                ${selectedField.required ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all 
                                                ${selectedField.required ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center px-6">
                            <div className="p-6 bg-slate-50 rounded-[24px] mb-6">
                                <Settings size={40} className="text-slate-200" />
                            </div>
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Configuration Matrix</h4>
                            <p className="text-xs font-bold text-slate-400 mt-2">Select a field from the center canvas to configure its unique properties.</p>
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
}
