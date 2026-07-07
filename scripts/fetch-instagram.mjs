// Best-effort fetch of recent Instagram images for @ciseldsouza.
// Run locally: node scripts/fetch-instagram.mjs
// If Instagram blocks the request, drop images into src/assets/instagram/ manually —
// the site renders whatever that folder contains and hides the strip when empty.
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const USERNAME = 'ciseldsouza';
const OUT_DIR = 'src/assets/instagram';
const MAX_IMAGES = 6;

const res = await fetch(
  `https://www.instagram.com/api/v1/users/web_profile_info/?username=${USERNAME}`,
  {
    headers: {
      // Public web app id Instagram's own frontend sends; required for a JSON response.
      'x-ig-app-id': '936619743392459',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  }
);

if (!res.ok) {
  console.error(`Instagram responded ${res.status}. Add images to ${OUT_DIR}/ manually.`);
  process.exit(1);
}

const json = await res.json();
const edges = json?.data?.user?.edge_owner_to_timeline_media?.edges ?? [];
if (edges.length === 0) {
  console.error(`No posts found (private account or changed API). Add images to ${OUT_DIR}/ manually.`);
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
let saved = 0;
for (const { node } of edges.slice(0, MAX_IMAGES)) {
  const img = await fetch(node.display_url);
  if (!img.ok) continue;
  const file = path.join(OUT_DIR, `${node.shortcode}.jpg`);
  await writeFile(file, Buffer.from(await img.arrayBuffer()));
  console.log(`saved ${file}`);
  saved++;
}
console.log(saved > 0 ? `done: ${saved} images.` : 'no images saved — add manually.');
