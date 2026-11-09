"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Mic,
  Plus,
  Search,
  Settings,
  Trash2,
  Play,
  Phone,
  PhoneCall,
  Volume2,
  Sparkles,
  Globe2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import AgentConfigModal, { VoiceAgentData } from "./AgentConfigModal";
import WebRTCCallModal from "@/components/WebRTCCallModal";
import { useOrg } from "@/contexts/OrgContext";
import { supabase } from "@/lib/supabaseClient";

export default function VoiceAgentsTab() {
  const { org } = useOrg();
  const [agents, setAgents] = useState<VoiceAgentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<VoiceAgentData | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeCallAgent, setActiveCallAgent] = useState<VoiceAgentData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const orgParam = org?.id ? `?org_id=${org.id}` : '';
      
      const res = await fetch(`/api/voice/agents${orgParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-org-id': org?.id || ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAgents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch voice agents:", err);
    } finally {
      setLoading(false);
    }
  }, [org?.id]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents, org?.id]);

  const handleCreateNew = () => {
    setSelectedAgent(null);
    setIsConfigOpen(true);
  };

  const handleEdit = (agent: VoiceAgentData) => {
    setSelectedAgent(agent);
    setIsConfigOpen(true);
  };

  const handleDelete = async (agent: VoiceAgentData) => {
    if (!agent.id) return;
    if (!confirm(`Are you sure you want to delete the voice agent "${agent.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(agent.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const orgParam = org?.id ? `&org_id=${org.id}` : '';

      const res = await fetch(`/api/voice/agents?id=${agent.id}${orgParam}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-org-id': org?.id || ''
        }
      });
      if (res.ok) {
        setAgents((prev) => prev.filter((a) => a.id !== agent.id));
      } else {
        alert("Failed to delete voice agent");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting voice agent");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (agent: VoiceAgentData) => {
    if (!agent.id) return;
    const newActive = !agent.active;
    // Optimistic UI update
    setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, active: newActive } : a)));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';

      await fetch("/api/voice/agents", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-org-id": org?.id || ''
        },
        body: JSON.stringify({
          id: agent.id,
          active: newActive,
          organization_id: org?.id
        })
      });
    } catch (err) {
      console.error("Failed to toggle status:", err);
      fetchAgents();
    }
  };

  const copyNumber = (num: string, id: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.telephone_number || "").includes(search) ||
      (a.language || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Voice Agent Builder
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage your multilingual Gemini Live voice bots, prompts, phone numbers, and sensitivity settings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents or numbers..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={fetchAgents}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition"
            title="Refresh agents"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create Voice Agent
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 text-xs">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
          Loading voice agents...
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="py-20 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center text-center p-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Mic className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mb-1">
            {search ? "No agents matching your search" : "No Voice Agents Found"}
          </h3>
          <p className="text-xs text-gray-400 max-w-md mb-5">
            {search
              ? "Try adjusting your search criteria or clearing the search query."
              : "Get started by building your first AI voice agent. Configure its system prompt, choose a voice persona, and attach a telephone number."}
          </p>
          {!search && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              Build Your First Agent
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-3xl p-5 shadow-sm transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Card Header: Avatar, Name, Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold text-sm border border-blue-500/20">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {agent.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {agent.language || "English"}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                          {agent.voice_profile || "Aoede"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <button
                    onClick={() => handleToggleActive(agent)}
                    title={agent.active ? "Click to deactivate" : "Click to activate"}
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full transition flex items-center gap-1 ${
                      agent.active
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-200"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${agent.active ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                    {agent.active ? "Active" : "Inactive"}
                  </button>
                </div>

                {/* Description */}
                {agent.description && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {agent.description}
                  </p>
                )}

                {/* Assigned Numbers Box */}
                <div className="space-y-2 py-3 px-3.5 rounded-2xl bg-gray-50 dark:bg-gray-850/60 border border-gray-100 dark:border-gray-800 mb-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Inbound Number
                    </span>
                    {agent.telephone_number ? (
                      <button
                        onClick={() => copyNumber(agent.telephone_number, `${agent.id}-phone`)}
                        className="font-mono text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-blue-600 flex items-center gap-1"
                      >
                        {agent.telephone_number}
                        {copiedId === `${agent.id}-phone` ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">None assigned</span>
                    )}
                  </div>

                  {agent.transfer_number && (
                    <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 dark:border-gray-700/60">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        Transfer Handover
                      </span>
                      <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                        {agent.transfer_number}
                      </span>
                    </div>
                  )}
                </div>

                {/* System Prompt Snippet Preview */}
                <div className="mb-4">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 mb-1">
                    System Prompt
                  </p>
                  <p className="text-[11px] font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-150 dark:border-gray-800 line-clamp-3 leading-relaxed">
                    {agent.outbound_system_prompt || agent.system_prompt || (
                      <span className="text-gray-400 italic">No prompt configured</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-150 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setActiveCallAgent(agent)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 text-xs font-bold transition shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Test Call
                </button>

                <button
                  type="button"
                  onClick={() => handleEdit(agent)}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition"
                  title="Configure Agent"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(agent)}
                  disabled={deletingId === agent.id}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                  title="Delete Agent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Agent Configuration Modal */}
      <AgentConfigModal
        agent={selectedAgent}
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSaved={fetchAgents}
        onTestCall={(agent) => {
          setIsConfigOpen(false);
          setActiveCallAgent(agent);
        }}
      />

      {/* Live WebRTC In-Browser Test Modal */}
      {activeCallAgent && activeCallAgent.id && (
        <WebRTCCallModal
          agentId={activeCallAgent.id}
          agentName={activeCallAgent.name}
          onClose={() => setActiveCallAgent(null)}
        />
      )}
    </div>
  );
}
