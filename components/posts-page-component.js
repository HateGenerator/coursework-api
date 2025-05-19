import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";
import { likePost, dislikePost } from "../api.js";

export function renderPostsPageComponent({ appEl }) {
  const renderPosts = () => {
    console.log("Rendering posts:", posts);

    const postsHtml = posts
      .map((post) => {
        // Упрощённый вывод даты
        const date = new Date(post.createdAt);
        const createdAt = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

        return `
          <li class="post">
            <div class="post-header" data-user-id="${post.user.id}">
              <img src="${post.user.imageUrl}" class="post-header__user-image" alt="User avatar">
              <p class="post-header__user-name">${post.user.name}</p>
            </div>
            <div class="post-image-container">
              <img class="post-image" src="${post.imageUrl}" alt="Post image">
            </div>
            <div class="post-likes">
              <button data-post-id="${post.id}" class="like-button ${post.isLiked ? "liked" : ""}">
                <img src="./assets/images/like-${post.isLiked ? "active" : "not-active"}.svg">
              </button>
              <p class="post-likes-text">
                Нравится: <strong>${post.likes.length}</strong>
              </p>
            </div>
            <p class="post-text">
              <span class="user-name">${post.user.name}</span>
              ${post.description}
            </p>
            <p class="post-date">${createdAt}</p>

            ${user && post.user.login === user.login ? `
              <button class="delete-button" data-post-id="${post.id}">Удалить</button>
            ` : ""}
          </li>`;
      })
      .join("");

    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <ul class="posts">${postsHtml}</ul>
      </div>`;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
      user,
      goToPage,
    });

    // Переход к пользователю
    for (let userEl of document.querySelectorAll(".post-header")) {
      userEl.addEventListener("click", () => {
        const userId = userEl.dataset.userId;
        console.log("Navigating to user posts page:", userId);
        goToPage(USER_POSTS_PAGE, { userId });
      });
    }

    // Лайки
  for (let likeButton of document.querySelectorAll(".like-button")) {
  likeButton.addEventListener("click", () => {
    const postId = likeButton.dataset.postId;
    const post = posts.find((p) => p.id === postId);
    const token = user ? `Bearer ${user.token}` : undefined;

    console.log("Liking/disliking post:", postId);

    const action = post.isLiked ? dislikePost : likePost;

    action({ token, postId }).then(({ post: updatedPost }) => {
      const index = posts.findIndex((p) => p.id === postId);
      posts[index] = updatedPost;

      // Получаем элемент из DOM
      const buttonEl = document.querySelector(`[data-post-id="${postId}"]`);
      const imageEl = buttonEl?.querySelector("img");

      if (imageEl) {
        // Меняем изображение на active/not-active
        imageEl.src = "./assets/images/like-" + (updatedPost.isLiked ? "active" : "not-active") + ".svg";

        // Запускаем анимацию пульсации
        imageEl.classList.add("liked");
        setTimeout(() => imageEl.classList.remove("liked"), 300);
      }

      renderPosts(); // Перерисовываем посты для обновления количества лайков
    });
  });
}

    // Удаление поста
    for (let deleteButton of document.querySelectorAll(".delete-button")) {
      deleteButton.addEventListener("click", (event) => {
        const postId = deleteButton.dataset.postId;

        if (!confirm("Вы точно хотите удалить пост?")) return;

        fetch(`https://wedev-api.sky.pro/api/v1/prod/instapro/ ${postId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
          .then(() => {
            const index = posts.findIndex((p) => p.id === postId);
            posts.splice(index, 1);
            renderPosts();
          })
          .catch((error) => {
            console.error("Ошибка удаления поста:", error);
            alert("Не удалось удалить пост");
          });
      });
    }
  };

  renderPosts();
}