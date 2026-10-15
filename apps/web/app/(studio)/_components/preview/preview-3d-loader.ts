import dynamic from "next/dynamic";

/** three.js only loads when the 3D tab is opened. */
export const Preview3dLoader = dynamic(() => import("./preview-3d"), {
  ssr: false,
});
