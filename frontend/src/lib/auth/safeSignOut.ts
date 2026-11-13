import { signOut } from "next-auth/react";
import { getPendingReviewsCount, clearOfflineStores } from "@/lib/offline/db";

/**
 * Safe sign-out guard:
 * 1. Checks if un-synced offline review grades exist in IndexedDB outbox.
 * 2. Warns the user before discarding pending grades.
 * 3. Clears IndexedDB offline stores and instructs Service Worker to purge API cache.
 * 4. Triggers NextAuth signOut.
 */
export async function safeSignOut(): Promise<boolean> {
  if (typeof window !== "undefined") {
    const pendingCount = await getPendingReviewsCount();
    if (pendingCount > 0) {
      const confirmDiscard = window.confirm(
        `You have ${pendingCount} unsynced review${
          pendingCount === 1 ? "" : "s"
        } in your offline outbox. If you sign out now, these reviews will be discarded. Do you wish to proceed?`,
      );
      if (!confirmDiscard) {
        return false;
      }
    }

    // Clear IndexedDB stores
    await clearOfflineStores();

    // Inform active Service Worker to purge user-specific API response cache
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "LOGOUT" });
    }
  }

  await signOut({ callbackUrl: "/login" });
  return true;
}

