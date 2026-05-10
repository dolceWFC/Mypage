async function loadPosts() {
  const response = await fetch("/blog/data/posts.json");
  const posts = await response.json();

  const container = document.getElementById("postsList");

  posts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(post => {

      const card = document.createElement("a");

      card.className = "post-card";

      card.href = `/blog/post.html?slug=${post.slug}`;

      card.innerHTML = `
        <img src="${post.cover}" class="post-cover">

        <div class="post-content">
          <div class="post-date">${post.date}</div>

          <h2>${post.title}</h2>

          <p>${post.summary}</p>
        </div>
      `;

      container.appendChild(card);
    });
}

loadPosts();