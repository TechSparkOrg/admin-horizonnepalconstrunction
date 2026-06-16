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
