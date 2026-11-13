import React from "react";
import { FeaturesProvider } from "@/components/providers/FeaturesProvider";
import { DashboardClientLayout } from "@/components/layout/DashboardClientLayout";
import { FeatureFlags, DEFAULT_FEATURE_FLAGS } from "@/types/features";

async function resolveServerFeatureFlags(): Promise<FeatureFlags> {
  const backendBase =
    process.env.INTERNAL_BACKEND_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api";

  const url = backendBase.endsWith("/api")
    ? `${backendBase}/features`
    : `${backendBase.replace(/\/+$/, "")}/api/features`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return DEFAULT_FEATURE_FLAGS;
    const data = await res.json();
    return {
      pvp: Boolean(data?.pvp),
      arena: Boolean(data?.arena),
      interviews: Boolean(data?.interviews),
      algotracer: data?.algotracer !== undefined ? Boolean(data.algotracer) : true,
    };
  } catch {
    return DEFAULT_FEATURE_FLAGS;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialFlags = await resolveServerFeatureFlags();

  return (
    <FeaturesProvider initialFlags={initialFlags}>
      <DashboardClientLayout>{children}</DashboardClientLayout>
    </FeaturesProvider>
  );
}
