"use strict";

// Shows the site's version (navigation menu, privacy page's "Last updated" line): the highest vX.Y.Z tag on the GitHub repo,
// read at runtime so bumping the version only takes pushing a new tag.

const REPO = "yasser-dlewati/me";
const CACHE_KEY = "siteVersion";

// "v1.10.0" -> [1, 10, 0]; anything that isn't a version tag gives null
const parseVersion = (name) => {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(name);
  return match ? match.slice(1).map(Number) : null;
};

const compareVersions = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

// The API's tag order is by name, not by version (v1.10 lands before v1.9), so sort here
async function fetchLatestTag() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/tags?per_page=100`);
  if (!res.ok) throw new Error(`GitHub tags request failed: ${res.status}`);
  const tags = (await res.json())
    .map((tag) => ({ name: tag.name, version: parseVersion(tag.name) }))
    .filter((tag) => tag.version);
  if (!tags.length) return null;
  tags.sort((a, b) => compareVersions(b.version, a.version));
  return tags[0].name;
}

// The unauthenticated API allows 60 requests an hour per IP, so the version is fetched once per visit
function readCache() {
  try { return sessionStorage.getItem(CACHE_KEY); } catch { return null; }
}

function writeCache(value) {
  try { sessionStorage.setItem(CACHE_KEY, value); } catch { /* storage blocked: fetch again next time */ }
}

export async function initVersion() {
  const containers = document.querySelectorAll(".site-version");
  if (!containers.length) return;

  let tag = readCache();
  if (!tag) {
    try {
      tag = await fetchLatestTag();
    } catch {
      return; // Offline or rate limited: the version stays hidden
    }
    if (!tag) return;
    writeCache(tag);
  }

  containers.forEach((container) => {
    const link = container.querySelector("a");
    link.textContent = tag;
    link.href = `https://github.com/${REPO}/tree/${encodeURIComponent(tag)}`;
    container.hidden = false;
  });
}
