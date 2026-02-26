"use client";

import { useState, useEffect } from "react";
import { dsaApi } from "@/lib/api";
import { ArrowLeft, Shield, User, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  image: string | null;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const loadUsers = async () => {
    try {
      const data = await dsaApi.adminGetUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleRole = async (user: AppUser) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    if (user.email === session?.user?.email) {
      alert("You cannot demote yourself!");
      return;
    }
    if (confirm(`Change ${user.name || user.email}'s role to ${newRole}?`)) {
      await dsaApi.adminUpdateUserRole(user.id, newRole);
      loadUsers();
    }
  };

  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#222] bg-white/5">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {users.map((appUser) => (
              <tr key={appUser.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {appUser.image ? (
                        <img src={appUser.image} alt="" className="h-8 w-8 rounded-full" />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                            <User size={14} className="text-gray-400" />
                        </div>
                    )}
                    <div>
                      <p className="font-bold text-white text-sm">{appUser.name || "Anonymous"}</p>
                      <p className="text-xs text-gray-500">{appUser.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {new Date(appUser.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                      appUser.role === 'ADMIN' ? 'text-red-400 bg-red-400/10' : 'text-blue-400 bg-blue-400/10'
                  }`}>
                    {appUser.role === 'ADMIN' ? <Shield size={10} /> : <User size={10} />}
                    {appUser.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => toggleRole(appUser)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        appUser.role === 'ADMIN' 
                        ? 'border-gray-800 text-gray-500 hover:text-white hover:border-white/20' 
                        : 'border-red-500/20 text-red-400 hover:bg-red-500/10'
                    }`}
                  >
                    {appUser.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
