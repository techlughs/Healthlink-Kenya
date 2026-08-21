"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
    return localStorage.getItem("role");
}

function getServerSnapshot() {
    return null;
}

export function useStoredRole() {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}