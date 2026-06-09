# JavaScript Adapter Notes

The package is Python-first because it is easier to combine Scrapy-style crawling, PDF/OCR tooling, data science, and database pipelines in one deployment. JavaScript adapters can still be attached for site-specific extraction.

## Puppeteer Adapter Shape

```js
export async function extractWithPuppeteer(url, browser) {
  const page = await browser.newPage();
  const payloads = [];
  page.on("response", async (response) => {
    const type = response.headers()["content-type"] || "";
    if (type.includes("json")) {
      try {
        payloads.push({ url: response.url(), json: await response.json() });
      } catch {}
    }
  });
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const html = await page.content();
  await page.close();
  return { url, html, payloads };
}
```

## Axios + Cheerio Adapter Shape

```js
import axios from "axios";
import * as cheerio from "cheerio";

export async function extractStatic(url) {
  const response = await axios.get(url, {
    headers: { "user-agent": "Mozilla/5.0" },
    timeout: 30000
  });
  const $ = cheerio.load(response.data);
  return {
    title: $("h1").first().text().trim() || $("title").text().trim(),
    images: $("img").map((_, img) => $(img).attr("src")).get(),
    links: $("a").map((_, a) => $(a).attr("href")).get()
  };
}
```

Keep JS adapters narrow: use them where a particular site needs custom click flows or API interception, then pass the resulting HTML/payloads back into the normalized Python schema.
