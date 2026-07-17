const fs = require("fs");
const path = require("path");

const DOMAIN = "https://dolce-rhea.live";

const posts = JSON.parse(
    fs.readFileSync("./blog/data/posts.json", "utf-8")
);

const template = fs.readFileSync(
    "./blog/template.html",
    "utf-8"
);

// ===== 記事生成 =====

posts.forEach(post => {

    const plainTitle = post.title.replace(/<br>/g, " ");

    const html = template
        .replaceAll("{{title}}", post.title)
        .replaceAll("{{plainTitle}}", plainTitle)
        .replaceAll("{{summary}}", post.summary)
        .replaceAll("{{slug}}", post.slug)
        .replaceAll("{{cover}}", post.cover)
        .replaceAll("{{date}}", post.date);

    const dir = `./blog/articles/${post.slug}`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(dir, "index.html"),
        html
    );

    fs.copyFileSync(
        post.file,
        path.join(dir, "post.md")
    );

    console.log(`Generated: ${post.slug}`);
});


// ===== Sitemap生成 =====

const today = new Date().toISOString().split("T")[0];

const sitemapUrls = [
    {
        loc: `${DOMAIN}/`,
        lastmod: today,
    },
    {
        loc: `${DOMAIN}/blog/`,
        lastmod: today,
    },
    ...posts.map(post => ({
        loc: `${DOMAIN}/blog/articles/${post.slug}/`,
        lastmod: post.date,
    }))
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${sitemapUrls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
  </url>
`).join("")}

</urlset>
`;

fs.writeFileSync(
    "./sitemap.xml",
    sitemap
);

console.log("Generated: sitemap.xml");