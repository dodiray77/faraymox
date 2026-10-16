"use client"; // 💡 Kunci komponen ini khusus untuk lingkungan browser
import { useState, useEffect } from "react";

export default function StatusDeviceWrapper({ isConnected, isLoading }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
        isConnected
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/25 bg-red-500/10 text-red-300"
      }`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${isConnected ? "bg-emerald-400" : "bg-red-500"}`}
        />
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-500"}`}
        />
      </span>
      {isLoading ? "CONNECTING" : isConnected ? "ONLINE" : "OFFLINE"}
    </span>
  );
}
