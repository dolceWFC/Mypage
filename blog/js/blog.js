async function loadPosts() {

  const response = await fetch("/blog/data/posts.json");
  const posts = await response.json();

  const container = document.getElementById("postsList");

  const sortSelect = document.getElementById("sortSelect");

  const tagFilters = document.getElementById("tagFilters");

  // 選択中タグ
  const activeTags = new Set();

  // =========================
  // タグ収集
  // =========================

  const allTags = new Set();

  posts.forEach(post => {

    (post.tags || []).forEach(tag => {

      allTags.add(tag);

    });
  });

  // =========================
  // ALLボタン
  // =========================

  const allButton = document.createElement("button");

  allButton.textContent = "ALL";

  allButton.className = "filter-tag active";

  allButton.addEventListener("click", () => {

    activeTags.clear();

    updateTagButtons();

    renderPosts();
  });

  tagFilters.appendChild(allButton);

  // =========================
  // タグボタン生成
  // =========================

  [...allTags]
    .sort((a, b) => a.localeCompare(b, "ja"))
    .forEach(tag => {

      const button = document.createElement("button");

      button.textContent = tag;

      button.className = "filter-tag";

      button.dataset.tag = tag;

      button.addEventListener("click", () => {

        if (activeTags.has(tag)) {

          activeTags.delete(tag);

        } else {

          activeTags.add(tag);
        }

        updateTagButtons();

        renderPosts();
      });

      tagFilters.appendChild(button);
    });

  // =========================
  // ボタン状態更新
  // =========================

  function updateTagButtons() {

    document.querySelectorAll(".filter-tag")
      .forEach(button => {

        const tag = button.dataset.tag;

        if (!tag) {

          button.classList.toggle(
            "active",
            activeTags.size === 0
          );

          return;
        }

        button.classList.toggle(
          "active",
          activeTags.has(tag)
        );
      });
  }

  // =========================
  // 描画
  // =========================

  function renderPosts() {

    container.innerHTML = "";

    let filtered = [...posts];

    // タグフィルタ
    if (activeTags.size > 0) {

      filtered = filtered.filter(post => {

        const tags = post.tags || [];

        return [...activeTags].every(tag =>
          tags.includes(tag)
        );
      });
    }

    // 並び替え
    const sortValue = sortSelect.value;

    if (sortValue === "new") {

      filtered.sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      );

    } else if (sortValue === "old") {

      filtered.sort((a, b) =>
        new Date(a.date) - new Date(b.date)
      );

    } else if (sortValue === "title") {

      filtered.sort((a, b) =>
        a.title.localeCompare(b.title, "ja")
      );
    }

    // カード生成
    filtered.forEach(post => {

      const plainTitle = post.title.replace(/<br\s*\/?>/g, " ");

      const card = document.createElement("a");

      card.className = "post-card";

      card.href = `/blog/articles/${post.slug}/`;

      card.innerHTML = `
        <img src="${post.cover}" class="post-cover">

        <div class="post-content">

          <div class="post-card-date">
            ${post.date}
          </div>

          <h2>${plainTitle}</h2>

          <p>${post.summary}</p>

          <div class="post-tags">
            ${(post.tags || []).map(tag => `
              <span class="tag">${tag}</span>
            `).join("")}
          </div>

        </div>
      `;

      container.appendChild(card);
    });
  }

  renderPosts();

  sortSelect.addEventListener("change", renderPosts);
}

loadPosts();