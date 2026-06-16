"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useModelViewer } from "@/lib/model-viewer";

interface Props {
  src: string;
  className?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  ar?: boolean;
  arModes?: string;
}

export function ModelViewer({ src, className, autoRotate = true, cameraControls = true, ar, arModes }: Props) {
  const { loaded, loadModelViewer } = useModelViewer();

  useEffect(() => {
    if (!loaded) loadModelViewer();
  }, [loaded, loadModelViewer]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center bg-black/5 rounded-lg">
        <Loader2 className="size-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <model-viewer
      src={src}
      alt="3D Model"
      auto-rotate={autoRotate}
      camera-controls={cameraControls}
      ar={ar}
      ar-modes={arModes}
      class={className ?? "w-full h-full"}
    />
  );
}
