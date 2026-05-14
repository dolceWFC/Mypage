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

posts.forEach(post => {

    const html = template
        .replaceAll("{{title}}", post.title.replace(/<br>/g, " "))
        .replaceAll("{{summary}}", post.summary)
        .replaceAll("{{slug}}", post.slug)
        .replaceAll("{{cover}}", post.cover)
        .replaceAll("{{date}}", post.date);

    const dir = `./blog/${post.slug}`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
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

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${posts.map(post => `
  <url>
    <loc>${DOMAIN}/blog/${post.slug}/</loc>
    <lastmod>${post.date}</lastmod>
  </url>
`).join("")}

</urlset>
`;

fs.writeFileSync(
    "./sitemap.xml",
    sitemap
);

console.log("Generated: sitemap.xml");