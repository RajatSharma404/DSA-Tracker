"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search, MonitorPlay, Brain, BookOpen, Settings, LogOut, Code, Library, LayoutDashboard, Target } from "lucide-react";
import { signOut } from "next-auth/react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed left-1/2 top-1/2 z-[100] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0a0a0a]/90 shadow-2xl backdrop-blur-xl transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
    >
      <div className="flex items-center border-b border-white/10 px-4">
        <Search className="mr-2 h-5 w-5 shrink-0 text-white/40" />
        <Command.Input
          placeholder="Type a command or search..."
          className="flex h-14 w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 text-white scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <Command.Empty className="py-6 text-center text-sm text-white/50">
          No results found.
        </Command.Empty>
        
        <Command.Group heading="Navigation" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-white/40">
          <Command.Item
            onSelect={() => runCommand(() => router.push("/"))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/roadmap"))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Target className="mr-2 h-4 w-4" />
            Roadmap
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/problems"))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Code className="mr-2 h-4 w-4" />
            Problems Vault
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Learning & Practice" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-white/40">
          <Command.Item
            onSelect={() => runCommand(() => router.push("/review"))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Brain className="mr-2 h-4 w-4" />
            Daily Review (Spaced Repetition)
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/interviews"))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <MonitorPlay className="mr-2 h-4 w-4" />
            Mock Interviews
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/learn"))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Theory Modules
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Account" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-white/40">
          <Command.Item
            onSelect={() => runCommand(() => router.push("/settings"))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-white/10 aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => signOut({ callbackUrl: "/login" }))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:text-red-400 hover:aria-selected:text-red-400 hover:text-red-400 aria-selected:bg-red-500/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
