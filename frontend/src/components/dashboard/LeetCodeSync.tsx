"use client";

import React, { useState } from 'react';
import { dsaApi } from '@/lib/api';
import { RefreshCcw, Save, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function LeetCodeSync() {
  const [username, setUsername] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ count: number, problems: string[] } | null>(null);

  const handleSave = async () => {
    if (!username) return;
    setIsSaving(true);
    try {
      await dsaApi.updateLeetcodeUsername(username);
      alert('LeetCode username updated!');
    } catch (error) {
      console.error(error);
      alert('Failed to update username');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await dsaApi.syncLeetcode();
      setLastSyncResult({ count: result.syncedCount, problems: result.syncedProblems });
      if (result.syncedCount > 0) {
        alert(`Successfully synced ${result.syncedCount} new problems!`);
        window.location.reload(); // Refresh to show new progress
      } else {
        alert('No new problems to sync.');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to sync with LeetCode. Make sure your username is correct and public.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-[#0d0d0d] border border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <img src="https://leetcode.com/static/images/LeetCode_logo_rvs.png" className="h-5 w-5" alt="" />
          LeetCode Sync
        </h3>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
            ${isSyncing ? 'bg-gray-800 text-gray-500' : 'bg-[#ffa116] text-black hover:bg-[#ffb84d]'}
          `}
        >
          <RefreshCcw size={14} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="LeetCode Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 bg-[#1a1a1a] border border-[#222] rounded-xl px-4 py-3 text-sm focus:border-[#ffa116] outline-none"
          />
          <button 
            onClick={handleSave}
            disabled={isSaving || !username}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Save size={18} />
          </button>
        </div>
        <p className="text-[10px] text-gray-500 font-medium">
          Make sure your profile is public on LeetCode for the sync to work.
        </p>
      </div>

      {lastSyncResult && lastSyncResult.count > 0 && (
        <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl animate-in slide-in-from-bottom-2">
          <p className="text-xs font-bold text-green-400 mb-2 flex items-center gap-2">
            <CheckCircle2 size={14} /> Synced {lastSyncResult.count} problems
          </p>
          <div className="flex flex-wrap gap-2">
            {lastSyncResult.problems.map((p, i) => (
              <span key={i} className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/10">
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
