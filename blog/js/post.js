async function loadArticle() {

  const params = new URLSearchParams(window.location.search);

  const slug = params.get("slug");

  if (!slug) {
    document.getElementById("article").innerHTML =
      "<p>Article not found.</p>";
    return;
  }

  const postsResponse =
    await fetch("/blog/data/posts.json");

  const posts = await postsResponse.json();

  const post = posts.find(p => p.slug === slug);

  if (!post) {
    document.getElementById("article").innerHTML =
      "<p>Article not found.</p>";
    return;
  }

  document.title =
    `${post.title} | Dolce-Rhea`;

  const mdResponse = await fetch(post.file);

  const markdown = await mdResponse.text();

  document.getElementById("article").innerHTML =
    marked.parse(markdown);
}

loadArticle();