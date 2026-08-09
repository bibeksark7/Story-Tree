// Downscale the delivered artwork to the size it is actually drawn at.
//
// Reve exports at print resolution — the climbers arrived at 3584x4352 and the
// leaves at 4096x4096, against on-screen sizes of roughly 96x120 and 92x92.
// That is ~35MB of PNG for a page that needs well under one, and SVG <image>
// does not go through next/image, so none of it would be optimised at request
// time.
//
// Targets are ~3x the largest rendered size, which covers high-density phone
// screens with room to spare.
//
//   npm run optimize-art            # rewrite anything oversized
//   npm run optimize-art -- --check # report only, change nothing
//
// Originals stay in git history if a source file is ever needed again.
import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const DIR = resolve("public/tree");

/** Max width by asset family, in pixels. */
const TARGET: Array<[RegExp, number]> = [
  [/^climber-\d\.png$/, 512],
  [/^leaf-\d\.png$/, 384],
  [/^sky-\d\.png$/, 1280],
];

function targetFor(name: string): number | null {
  for (const [pattern, width] of TARGET) if (pattern.test(name)) return width;
  return null;
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const files = readdirSync(DIR).filter((f) => f.toLowerCase().endsWith(".png"));

  let before = 0;
  let after = 0;
  let changed = 0;

  for (const name of files.sort()) {
    const path = resolve(DIR, name);
    const target = targetFor(name);
    const size = statSync(path).size;
    before += size;

    if (!target) {
      after += size;
      continue;
    }

    const meta = await sharp(path).metadata();
    if ((meta.width ?? 0) <= target) {
      after += size;
      console.log(`  ${name.padEnd(18)} ${meta.width}px  already small enough`);
      continue;
    }

    if (checkOnly) {
      after += size;
      console.log(`  ${name.padEnd(18)} ${meta.width}px -> ${target}px  (would shrink)`);
      continue;
    }

    // Read fully before writing back to the same path.
    const out = await sharp(path)
      .resize({ width: target, withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();

    await sharp(out).toFile(path);
    const now = statSync(path).size;
    after += now;
    changed++;

    console.log(
      `  ${name.padEnd(18)} ${meta.width}px -> ${target}px   ` +
        `${(size / 1048576).toFixed(1)}MB -> ${(now / 1024).toFixed(0)}KB`,
    );
  }

  const mb = (n: number) => (n / 1048576).toFixed(1);
  console.log(
    `\n${changed} file(s) rewritten. Total ${mb(before)}MB -> ${mb(after)}MB` +
      (before > 0 ? ` (${Math.round((1 - after / before) * 100)}% smaller)` : ""),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
