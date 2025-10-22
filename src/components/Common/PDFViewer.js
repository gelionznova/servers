// import { createPluginRegistration } from "@embedpdf/core";
// import { EmbedPDF } from "@embedpdf/core/react";
// import { usePdfiumEngine } from "@embedpdf/engines/react";

// // Import the essential plugins
// import {
//   Viewport,
//   ViewportPluginPackage,
// } from "@embedpdf/plugin-viewport/react";
// import { Scroller, ScrollPluginPackage } from "@embedpdf/plugin-scroll/react";
// import { LoaderPluginPackage } from "@embedpdf/plugin-loader/react";
// import {
//   RenderLayer,
//   RenderPluginPackage,
// } from "@embedpdf/plugin-render/react";

// import { ZoomPluginPackage, ZoomMode } from "@embedpdf/plugin-zoom/react";
// import { ZoomToolbar } from "./ZoomToolbar";
// import { PagePointerProvider } from "@embedpdf/plugin-interaction-manager/react";

// // 1. Register the plugins you need
// const plugins = [
//   createPluginRegistration(LoaderPluginPackage, {
//     loadingOptions: {
//       type: "url",
//       pdfFile: {
//         id: "example-pdf",
//         url: "https://snippet.embedpdf.com/ebook.pdf",
//       },
//     },
//   }),
//   createPluginRegistration(ViewportPluginPackage),
//   createPluginRegistration(ScrollPluginPackage),
//   createPluginRegistration(RenderPluginPackage),
//   createPluginRegistration(ZoomPluginPackage, {
//     // Set the initial zoom level when a document loads
//     defaultZoomLevel: ZoomMode.FitPage,
//   }),
// ];

// export const PDFViewer = () => {
//   // 2. Initialize the engine with the React hook
//   const { engine, isLoading } = usePdfiumEngine();

//   if (isLoading || !engine) {
//     return <div>Loading PDF Engine...</div>;
//   }

//   // 3. Wrap your UI with the <EmbedPDF> provider
//   return (
//     <div style={{ height: "500px" }}>
//       <EmbedPDF engine={engine} plugins={plugins}>
//         <ZoomToolbar />
//         <Viewport
//           style={{
//             backgroundColor: "#f1f3f5",
//           }}
//         >
//           <Scroller
//             renderPage={({ width, height, pageIndex, scale }) => (
//               <div style={{ width, height }}>
//                 {/* The RenderLayer is responsible for drawing the page */}
//                 <RenderLayer pageIndex={pageIndex} scale={scale} />
//               </div>
//             )}
//           />
//         </Viewport>
//       </EmbedPDF>
//     </div>
//   );
// };

// src/components/Common/PDFViewer.js
import React, { useEffect, useMemo, useState } from "react";
import { createPluginRegistration } from "@embedpdf/core";
import { EmbedPDF } from "@embedpdf/core/react";
import { usePdfiumEngine } from "@embedpdf/engines/react";

import {
  Viewport,
  ViewportPluginPackage,
} from "@embedpdf/plugin-viewport/react";
import { Scroller, ScrollPluginPackage } from "@embedpdf/plugin-scroll/react";
import { LoaderPluginPackage } from "@embedpdf/plugin-loader/react";
import {
  RenderLayer,
  RenderPluginPackage,
} from "@embedpdf/plugin-render/react";
import { ZoomPluginPackage, ZoomMode } from "@embedpdf/plugin-zoom/react";

import { ZoomToolbar } from "./ZoomToolbar";

// Props:
// - fileUrl?: string        (PDF público)
// - authUrl?: string        (endpoint protegido)
// - token?: string          (Bearer para authUrl)
// - height?: string         (ej. "78vh")
// - id?: string             (identificador del documento para EmbedPDF)
export default function PDFViewer({
  fileUrl,
  authUrl,
  token,
  height = "78vh",
  id = "doc",
}) {
  const { engine, isLoading } = usePdfiumEngine();

  // Si viene authUrl, traemos el binario con Authorization y lo pasamos como ObjectURL
  const [blobUrl, setBlobUrl] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let revoke;
    const run = async () => {
      setErr(null);
      setBlobUrl(null);
      if (!authUrl) return;
      try {
        const resp = await fetch(authUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        revoke = url;
        setBlobUrl(url);
      } catch (e) {
        setErr(e.message || String(e));
      }
    };
    run();
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [authUrl, token]);

  const src = blobUrl || (fileUrl && fileUrl.trim()) || null;

  // Registramos plugins cada vez que cambia el source
  const plugins = useMemo(() => {
    if (!src) return [];
    return [
      createPluginRegistration(LoaderPluginPackage, {
        // Pasamos el ObjectURL o la URL pública
        loadingOptions: { type: "url", pdfFile: { id, url: src } },
      }),
      createPluginRegistration(ViewportPluginPackage),
      createPluginRegistration(ScrollPluginPackage),
      createPluginRegistration(RenderPluginPackage),
      createPluginRegistration(ZoomPluginPackage, {
        defaultZoomLevel: ZoomMode.FitWidth,
      }),
    ];
  }, [src, id]);

  if (isLoading || !engine) {
    return <div style={{ height, padding: 12 }}>Cargando visor…</div>;
  }
  if (err) {
    return (
      <div
        style={{
          height,
          padding: 12,
          border: "1px solid #f3d6d6",
          borderRadius: 8,
        }}
      >
        <strong>Error cargando PDF:</strong> {err}
      </div>
    );
  }
  if (!src) {
    return (
      <div
        style={{
          height,
          padding: 12,
          border: "1px dashed #ddd",
          borderRadius: 8,
        }}
      >
        <em>No se proporcionó ninguna URL de PDF.</em>
      </div>
    );
  }

  return (
    <div
      style={{ height, border: "1px solid rgba(0,0,0,.1)", borderRadius: 8 }}
    >
      <EmbedPDF engine={engine} plugins={plugins}>
        <ZoomToolbar />
        <Viewport style={{ backgroundColor: "#f1f3f5" }}>
          <Scroller
            renderPage={({ width, height, pageIndex, scale }) => (
              <div style={{ width, height }}>
                <RenderLayer pageIndex={pageIndex} scale={scale} />
              </div>
            )}
          />
        </Viewport>
      </EmbedPDF>
    </div>
  );
}
