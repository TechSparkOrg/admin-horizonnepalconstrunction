import type { MediaFormData } from "@/components/page_ui/media-form";

const VIDEO_EXTS = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"];
const MODEL_EXTS = [".glb", ".gltf", ".fbx", ".obj", ".stl", ".usdz", ".usd", ".ply", ".dae", ".3ds", ".blend", ".max"];

export function isVideoUrl(url: string): boolean {
  const ext = url.toLowerCase().split(".").pop();
  return ext ? VIDEO_EXTS.includes(`.${ext}`) : false;
}

export function isModelUrl(url: string): boolean {
  const ext = url.toLowerCase().split(".").pop();
  return ext ? MODEL_EXTS.includes(`.${ext}`) : false;
}

export function detectPlatform(url: string): { name: string; color: string; icon: string } {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) {
    return { name: "YouTube", color: "bg-red-100 text-red-700", icon: "▶️" };
  }
  if (u.includes("vimeo.com")) {
    return { name: "Vimeo", color: "bg-blue-100 text-blue-700", icon: "🎬" };
  }
  if (u.includes("dailymotion.com") || u.includes("dai.ly")) {
    return { name: "Dailymotion", color: "bg-gray-100 text-gray-700", icon: "▶️" };
  }
  if (u.includes("facebook.com") || u.includes("fb.watch")) {
    return { name: "Facebook", color: "bg-blue-100 text-blue-700", icon: "📱" };
  }
  if (u.includes("instagram.com")) {
    return { name: "Instagram", color: "bg-pink-100 text-pink-700", icon: "📸" };
  }
  if (u.includes("tiktok.com")) {
    return { name: "TikTok", color: "bg-gray-100 text-gray-700", icon: "🎵" };
  }
  return { name: "Video", color: "bg-gray-100 text-gray-600", icon: "▶️" };
}

export function toMediaPayload(data: MediaFormData, extra?: Record<string, unknown>): Record<string, unknown> {
  const base: Record<string, unknown> = {
    alt: data.alt,
    title: data.title,
    meta_title: data.meta_title,
    meta_description: data.meta_description,
    keywords: data.keywords,
    is_active: data.is_active,
  };
  if (data.project_link) base.project_link = data.project_link;
  if (data.slug) base.slug = data.slug;
  return { ...base, ...extra };
}
