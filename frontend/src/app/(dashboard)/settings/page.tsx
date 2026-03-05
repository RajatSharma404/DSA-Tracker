"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { dsaApi } from "@/lib/api";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [leetcodeSession, setLeetcodeSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await dsaApi.getUserSettings();
      if (response.leetcodeSession) {
        setLeetcodeSession(response.leetcodeSession);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      await dsaApi.updateLeetcodeSession(leetcodeSession);
      setMessage("✅ LeetCode session saved successfully!");
    } catch (error) {
      setMessage("❌ Failed to save settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">LeetCode Integration</h2>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
          <h3 className="font-semibold mb-2">
            How to get your LeetCode Session Cookie:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              Go to{" "}
              <a
                href="https://leetcode.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                LeetCode.com
              </a>{" "}
              and log in
            </li>
            <li>Open Developer Tools (F12)</li>
            <li>
              Go to <strong>Application</strong> tab → <strong>Cookies</strong>{" "}
              → <strong>https://leetcode.com</strong>
            </li>
            <li>
              Find the cookie named <strong>LEETCODE_SESSION</strong>
            </li>
            <li>Copy its value and paste it below</li>
          </ol>
        </div>

        <div className="mb-4">
          <label
            htmlFor="leetcodeSession"
            className="block text-sm font-medium mb-2"
          >
            LeetCode Session Cookie
          </label>
          <input
            id="leetcodeSession"
            type="text"
            value={leetcodeSession}
            onChange={(e) => setLeetcodeSession(e.target.value)}
            placeholder="Paste your LEETCODE_SESSION cookie value here"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading || !leetcodeSession}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>

        {message && (
          <div className="mt-4 p-3 rounded bg-gray-100 dark:bg-gray-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
