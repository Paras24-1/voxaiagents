"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Sliders,
  Code2,
  Phone,
  Play,
  Volume2,
  Copy,
  Check,
  Globe2,
  Cpu,
  Sparkles,
  Info,
  ShieldAlert,
  Mic,
  RotateCcw,
  History,
  Mail,
  UserCheck,
  CheckCircle2
} from "lucide-react";
import { useOrg } from "@/contexts/OrgContext";
import { supabase } from "@/lib/supabaseClient";

export interface VoiceAgentData {
  id?: string;
  name: string;
  language: string;
  lang_code: string;
  voice_profile: string;
  active: boolean;
  system_prompt: string;
  inbound_system_prompt: string;
  outbound_system_prompt: string;
  temperature: number;
  speech_threshold: number;
  silence_detection: number;
  telephone_number: string;
  transfer_number: string;
  notification_email: string;
  avatar_url?: string;
  description?: string;
  emotion_tone: string;
}

interface AgentConfigModalProps {
  agent: VoiceAgentData | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  onTestCall?: (agent: VoiceAgentData) => void;
}

const LANGUAGES = [
  { name: "English", code: "US" },
  { name: "Hindi", code: "IN" },
  { name: "Spanish", code: "ES" },
  { name: "French", code: "FR" },
  { name: "German", code: "DE" },
  { name: "Japanese", code: "JP" },
  { name: "Portuguese", code: "PT" },
];

const VOICE_PROFILES = [
  { id: "Aoede",  label: "Aoede",  gender: "Female", tone: "Bright & expressive",   emoji: "✨" },
  { id: "Kore",   label: "Kore",   gender: "Female", tone: "Warm & neutral",         emoji: "🌸" },
  { id: "Puck",   label: "Puck",   gender: "Male",   tone: "Playful & light",        emoji: "🎭" },
  { id: "Charon", label: "Charon", gender: "Male",   tone: "Deep & calm",            emoji: "🌊" },
  { id: "Fenrir", label: "Fenrir", gender: "Male",   tone: "Bold & confident",       emoji: "⚡" },
];

const EMOTION_TONES = [
  { id: "professional", label: "Professional & Corporate" },
  { id: "friendly", label: "Friendly & Warm" },
  { id: "energetic", label: "Energetic & Persuasive" },
  { id: "calm", label: "Calm & Empathetic" },
];

export default function AgentConfigModal({
  agent,
  isOpen,
  onClose,
  onSaved,
  onTestCall
}: AgentConfigModalProps) {
  const { org } = useOrg();
  const [formData, setFormData] = useState<VoiceAgentData>({
    name: "",
    language: "English",
    lang_code: "US",
    voice_profile: "Aoede",
    active: true,
    system_prompt: "",
    inbound_system_prompt: "",
    outbound_system_prompt: "",
    temperature: 0.70,
    speech_threshold: -42,
    silence_detection: 600,
    telephone_number: "",
    transfer_number: "",
    notification_email: "",
    description: "",
    emotion_tone: "professional"
  });

  const [activeTab, setActiveTab] = useState<"general" | "prompts" | "telephony" | "tuning" | "embed">("general");
  const [promptSubTab, setPromptSubTab] = useState<"outbound" | "inbound">("outbound");
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedAgentId, setCopiedAgentId] = useState(false);

  useEffect(() => {
    if (agent) {
      setFormData({
        id: agent.id,
        name: agent.name || "",
        language: agent.language || "English",
        lang_code: agent.lang_code || "US",
        voice_profile: agent.voice_profile || agent.voice_profile || "Aoede",
        active: agent.active !== undefined ? agent.active : true,
        system_prompt: agent.system_prompt || agent.outbound_system_prompt || "",
        inbound_system_prompt: agent.inbound_system_prompt || "",
        outbound_system_prompt: agent.outbound_system_prompt || agent.system_prompt || "",
        temperature: agent.temperature || 0.70,
        speech_threshold: agent.speech_threshold || -42,
        silence_detection: agent.silence_detection || 600,
        telephone_number: agent.telephone_number || "",
        transfer_number: agent.transfer_number || "",
        notification_email: agent.notification_email || "",
        description: agent.description || "",
        emotion_tone: agent.emotion_tone || "professional"
      });

      if (agent.id) {
        fetchVersions(agent.id);
      }
    } else {
      setFormData({
        name: "",
        language: "English",
        lang_code: "US",
        voice_profile: "Aoede",
        active: true,
        system_prompt: "",
        inbound_system_prompt: "",
        outbound_system_prompt: "",
        temperature: 0.70,
        speech_threshold: -42,
        silence_detection: 600,
        telephone_number: "",
        transfer_number: "",
        notification_email: "",
        description: "",
        emotion_tone: "professional"
      });
      setVersions([]);
    }
    setActiveTab("general");
    setError(null);
    setSaveSuccess(false);
  }, [agent, isOpen]);

  const fetchVersions = async (agentId: string) => {
    setLoadingVersions(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const orgParam = org?.id ? `&org_id=${org.id}` : '';

      const res = await fetch(`/api/voice/agents/versions?agent_id=${agentId}${orgParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-org-id': org?.id || ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        setVersions(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn("Could not load prompt versions", e);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleLanguageChange = (langName: string) => {
    const selected = LANGUAGES.find((l) => l.name === langName);
    setFormData((prev) => ({
      ...prev,
      language: langName,
      lang_code: selected ? selected.code : "US"
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please provide a name for this voice agent.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const method = formData.id ? "PUT" : "POST";
      const orgParam = org?.id ? `?org_id=${org.id}` : '';

      const res = await fetch(`/api/voice/agents${orgParam}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-org-id": org?.id || ''
        },
        body: JSON.stringify({
          ...formData,
          organization_id: org?.id
        })
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || "Failed to save voice agent");
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onSaved();
        onClose();
      }, 900);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save voice agent");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                {formData.id ? `Configure: ${formData.name}` : "Create New Voice Agent"}
                {formData.id && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(formData.id!);
                      setCopiedAgentId(true);
                      setTimeout(() => setCopiedAgentId(false), 2000);
                    }}
                    className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 flex items-center gap-1 hover:bg-blue-100 transition"
                    title="Click to copy Agent ID"
                  >
                    <span>ID: {formData.id}</span>
                    {copiedAgentId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
                {formData.active ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    Live Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    Inactive
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Configure AI prompts, Gemini Live voices, phone routing, and sensitivity parameters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {formData.id && onTestCall && (
              <button
                type="button"
                onClick={() => onTestCall(formData)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Test Voice Call
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-gray-150 dark:border-gray-800 px-6 gap-6 bg-white dark:bg-gray-900 text-xs font-bold">
          {[
            { id: "general", label: "Voice & Persona", icon: Sparkles },
            { id: "prompts", label: "Bot Prompts", icon: Code2 },
            { id: "telephony", label: "Phone Routing", icon: Phone },
            { id: "tuning", label: "AI Latency & VAD", icon: Sliders },
            { id: "embed", label: "Web Widget", icon: Globe2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all ${
                  active
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Contents */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Voice Agent saved successfully!</span>
            </div>
          )}

          {/* TAB 1: GENERAL VOICE & PERSONA */}
          {activeTab === "general" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {formData.id && (
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block mb-0.5">
                      AI Agent ID (UUID)
                    </label>
                    <p className="font-mono text-xs font-bold text-gray-800 dark:text-gray-200 select-all">
                      {formData.id}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(formData.id!);
                      setCopiedAgentId(true);
                      setTimeout(() => setCopiedAgentId(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:border-blue-400 transition shrink-0"
                  >
                    {copiedAgentId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedAgentId ? "Copied ID" : "Copy Agent ID"}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sales Specialist, Front Desk Receptionist"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Spoken Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.name}>
                        {l.name} ({l.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Short Description / Purpose
                </label>
                <input
                  type="text"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Handles inbound real-estate inquiries and schedules consultations"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Gemini Voice Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Gemini Multimodal Live Voice Profile
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {VOICE_PROFILES.map((v) => {
                    const isSelected = formData.voice_profile === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setFormData({ ...formData, voice_profile: v.id })}
                        className={`cursor-pointer p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm ring-1 ring-blue-500"
                            : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-850"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                            <span>{v.emoji}</span>
                            {v.label}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {v.gender}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {v.tone}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Persona Emotion / Tone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Emotion & Conversation Tone
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {EMOTION_TONES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, emotion_tone: t.id })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
                        formData.emotion_tone === t.id
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                          : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Active Status</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    When active, this agent is available for campaigns and telephone inbound answering.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: PROMPTS & PERSONA */}
          {activeTab === "prompts" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPromptSubTab("outbound")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      promptSubTab === "outbound"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    Outbound Campaign Prompt
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromptSubTab("inbound")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      promptSubTab === "inbound"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    Inbound Receptionist Prompt
                  </button>
                </div>

                {versions.length > 0 && (
                  <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                    <History className="w-3.5 h-3.5" />
                    {versions.length} versions recorded
                  </span>
                )}
              </div>

              {promptSubTab === "outbound" ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Outbound Calling Prompt & Script
                    </label>
                    <span className="text-[10px] text-gray-400">
                      Executed when dialing customers in voice campaigns
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={formData.outbound_system_prompt}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        outbound_system_prompt: e.target.value,
                        system_prompt: e.target.value
                      })
                    }
                    placeholder="You are an AI sales representative at VoxAura. Your goal is to introduce our service and book a consultation..."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Inbound Receptionist Prompt
                    </label>
                    <span className="text-[10px] text-gray-400">
                      Executed when customers call into your assigned phone number
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={formData.inbound_system_prompt}
                    onChange={(e) => setFormData({ ...formData, inbound_system_prompt: e.target.value })}
                    placeholder="You are a 24/7 receptionist answering inbound calls. Greet the caller warmly, answer their questions, and offer to transfer them if needed..."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y"
                  />
                </div>
              )}

              {/* Version History Drawer */}
              {versions.length > 0 && (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-blue-500" />
                    Previous Prompt Versions
                  </p>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {versions.map((ver) => (
                      <div
                        key={ver.id}
                        className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="truncate max-w-[70%]">
                          <span className="font-bold text-gray-800 dark:text-gray-200">v{ver.version}</span>
                          <span className="text-gray-400 text-[10px] ml-2">
                            {new Date(ver.created_at).toLocaleDateString()}
                          </span>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">{ver.system_prompt}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Restore prompt to v${ver.version}?`)) {
                              setFormData((prev) => ({
                                ...prev,
                                outbound_system_prompt: ver.system_prompt || prev.outbound_system_prompt,
                                system_prompt: ver.system_prompt || prev.system_prompt
                              }));
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-[10px] font-bold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TELEPHONY & CALL ROUTING */}
          {activeTab === "telephony" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Telephony Carrier & Caller ID Binding
                </p>
                Configure the virtual phone number used to dispatch voice campaigns and receive inbound customer calls via Vobiz / Twilio.
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Assigned Virtual Telephone Number (Caller ID)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.telephone_number}
                    onChange={(e) => setFormData({ ...formData, telephone_number: e.target.value })}
                    placeholder="e.g. +918071583309 or +14155552671"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Inbound calls to this number will automatically be answered by this voice agent.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Human Handover Destination Number (Call Transfer)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.transfer_number}
                    onChange={(e) => setFormData({ ...formData, transfer_number: e.target.value })}
                    placeholder="e.g. +919876543210 (Mobile number of your human agent)"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <UserCheck className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  When a customer asks to speak with a human or expresses high intent, the bot will live-bridge the call to this number.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Notification Email for Call Summaries
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.notification_email}
                    onChange={(e) => setFormData({ ...formData, notification_email: e.target.value })}
                    placeholder="e.g. manager@yourcompany.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Receive email alerts with call transcripts and AI summaries upon call completion.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: AI LATENCY & VAD TUNING */}
          {activeTab === "tuning" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-700 dark:text-indigo-300">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Voice Activity Detection (VAD) & LLM Hyperparameters
                </p>
                Fine-tune the response speed, interruption handling, and speech sensitivity of the Gemini Live audio pipeline.
              </div>

              {/* Temperature */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-gray-700 dark:text-gray-300">LLM Temperature</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">{formData.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>Precise & Deterministic (0.0)</span>
                  <span>Creative & Varied (1.0)</span>
                </div>
              </div>

              {/* Speech Threshold */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-gray-700 dark:text-gray-300">Speech Threshold (VAD Sensitivity)</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">{formData.speech_threshold} dB</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="-20"
                  step="1"
                  value={formData.speech_threshold}
                  onChange={(e) => setFormData({ ...formData, speech_threshold: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>Sensitive (Catches whispers: -60 dB)</span>
                  <span>Strict (Filters background noise: -20 dB)</span>
                </div>
              </div>

              {/* Silence Detection */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-gray-700 dark:text-gray-300">Silence Detection Delay</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">{formData.silence_detection} ms</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="2000"
                  step="50"
                  value={formData.silence_detection}
                  onChange={(e) => setFormData({ ...formData, silence_detection: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>Fast Interruption (300 ms)</span>
                  <span>Patient / Conversational (2000 ms)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WEB WIDGET EMBED */}
          {activeTab === "embed" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Embed this voice assistant directly into your website so visitors can talk to your agent with one click.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  JavaScript Embed Snippet
                </label>
                <div className="relative">
                  <pre className="p-3.5 rounded-2xl bg-gray-950 text-gray-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`<!-- VoxAura WebRTC Live Voice Embed -->
<script
  src="https://cdn.voxaiagents.com/widget/v1/voice.js"
  data-agent-id="${formData.id || 'YOUR_AGENT_ID'}"
  data-theme="dark"
  async>
</script>`}
                  </pre>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`<!-- VoxAura WebRTC Live Voice Embed -->\n<script src="https://cdn.voxaiagents.com/widget/v1/voice.js" data-agent-id="${formData.id || 'YOUR_AGENT_ID'}" data-theme="dark" async></script>`);
                      setCopiedEmbed(true);
                      setTimeout(() => setCopiedEmbed(false), 2000);
                    }}
                    className="absolute right-3 top-3 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold flex items-center gap-1"
                  >
                    {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedEmbed ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer / Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-150 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : formData.id ? "Save Changes" : "Create Agent"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
