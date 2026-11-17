/**
 * Generates the placeholder app icons (T07). Run: `npm run icons`
 * Output is committed, so this only needs re-running when the design changes.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { ImageResponse } from "next/og";

const BACKGROUND = "#18181b"; // zinc-900
const FOREGROUND = "#fafafa"; // zinc-50
const ACCENT = "#a3e635"; // lime-400

function Icon({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BACKGROUND,
        position: "relative",
      }}
    >
      <div
        style={{
          fontSize: size * 0.62,
          fontWeight: 800,
          color: FOREGROUND,
          lineHeight: 1,
          display: "flex",
        }}
      >
        S
      </div>
      <div
        style={{
          position: "absolute",
          right: size * 0.2,
          bottom: size * 0.2,
          width: size * 0.12,
          height: size * 0.12,
          borderRadius: size,
          background: ACCENT,
          display: "flex",
        }}
      />
    </div>
  );
}

const targets: { path: string; size: number }[] = [
  { path: "public/icons/icon-192.png", size: 192 },
  { path: "public/icons/icon-512.png", size: 512 },
  { path: "src/app/apple-icon.png", size: 180 },
];

async function main() {
  await mkdir("public/icons", { recursive: true });
  for (const { path, size } of targets) {
    const response = new ImageResponse(<Icon size={size} />, { width: size, height: size });
    await writeFile(path, Buffer.from(await response.arrayBuffer()));
    console.log(`wrote ${path} (${size}x${size})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
