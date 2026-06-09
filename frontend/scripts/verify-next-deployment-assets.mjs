const DEFAULT_TIMEOUT_MS = 20000;
const NEXT_STATIC_PATTERN = /(?:src|href)="([^"]*_next\/static\/[^"]+)"/g;

const isDirectRun = process.argv[1] && import.meta.url === new URL(process.argv[1], "file:").href;

function withTimeout(promise, timeoutMs, label) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms: ${label}`)), timeoutMs);
  });
  return Promise.race([promise, timeout]);
}

function toAbsoluteAssetUrl(pageUrl, assetPath) {
  return new URL(assetPath, pageUrl).toString();
}

function extractNextAssets(html) {
  const assets = [];
  let match = NEXT_STATIC_PATTERN.exec(html);

  while (match) {
    if (!assets.includes(match[1])) {
      assets.push(match[1]);
    }
    match = NEXT_STATIC_PATTERN.exec(html);
  }

  return assets;
}

function isExpectedAssetResponse(response, contentType, assetPath) {
  if (!response.ok) {
    return false;
  }

  if (assetPath.endsWith(".js")) {
    return contentType.includes("javascript") || contentType.includes("text/plain");
  }

  if (assetPath.endsWith(".css")) {
    return contentType.includes("text/css") || contentType.includes("text/plain");
  }

  return true;
}

export async function fetchText(url) {
  const response = await withTimeout(fetch(url), DEFAULT_TIMEOUT_MS, url);
  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    contentType: response.headers.get("content-type") || "",
    text,
  };
}

export async function verifyAsset(pageUrl, assetPath) {
  const assetUrl = toAbsoluteAssetUrl(pageUrl, assetPath);
  const response = await withTimeout(fetch(assetUrl), DEFAULT_TIMEOUT_MS, assetUrl);
  const contentType = response.headers.get("content-type") || "";

  return {
    assetPath,
    assetUrl,
    status: response.status,
    contentType,
    ok: isExpectedAssetResponse(response, contentType, assetPath),
  };
}

export async function verifyPage(pageUrl) {
  const page = await fetchText(pageUrl);
  const assets = extractNextAssets(page.text);
  const assetResults = [];

  for (const assetPath of assets) {
    assetResults.push(await verifyAsset(pageUrl, assetPath));
  }

  const badAssets = assetResults.filter((asset) => !asset.ok);

  return {
    pageUrl,
    page,
    assets,
    assetResults,
    badAssets,
    ok: page.ok && assets.length > 0 && badAssets.length === 0,
  };
}

export function printVerificationResult(result) {
  const pageStatus = `${result.page.status} ${result.page.contentType}`.trim();

  console.log(`\n${result.ok ? "PASS" : "FAIL"} ${result.pageUrl}`);
  console.log(`Page: ${pageStatus}`);
  console.log(`Next static assets: ${result.assets.length}`);
  console.log(`Broken assets: ${result.badAssets.length}`);

  if (result.assets.length === 0) {
    console.log("No /_next/static assets found in the HTML.");
  }

  for (const asset of result.badAssets) {
    console.log(`- ${asset.status} ${asset.contentType} ${asset.assetPath}`);
  }
}

if (isDirectRun) {
  const urls = process.argv.slice(2);

  if (urls.length === 0) {
    console.error(
      "Usage: node scripts/verify-next-deployment-assets.mjs <url> [url...]"
    );
    process.exit(1);
  }

  let hasFailure = false;

  for (const url of urls) {
    const result = await verifyPage(url);
    printVerificationResult(result);

    if (!result.ok) {
      hasFailure = true;
    }
  }

  if (hasFailure) {
    process.exit(1);
  }
}
