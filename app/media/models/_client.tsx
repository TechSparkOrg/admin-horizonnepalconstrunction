"use client";

import { MediaListClient } from "@/components/page_ui/media-list-client";

const MODEL_ACCEPT = ".glb,.gltf,.fbx,.obj,.stl,.step,.stp,.iges,.igs,.dae,.3ds,.ply,.blend,.max,.c4d,.ma,.mb,.dwg,.dxf,.rvt,.ifc,.usdz,.usd,.abc,.amf,.3mf,.skp";

export default function ModelsClient() {
  return (
    <MediaListClient
      groupTitle="3D Models"
      labelSingular="Model"
      subtitle="Media / 3D Models"
      accept={MODEL_ACCEPT}
    />
  );
}
