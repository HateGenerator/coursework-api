import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";
import { likePost, dislikePost } from "../api.js";
import { formatDistanceToNow } from "https://cdn.jsdelivr.net/npm/date-fns@2.29.3/+esm";
import ru from "https://cdn.jsdelivr.net/npm/date-fns@2.29.3/locale/ru/+esm";

export function renderPostsPageComponent({ appEl }) {
  console.log("renderPostsPageComponent called");
  const renderPosts = () => {
    console.log("Rendering posts:", posts);
    const postsHtml = posts
      .map((post) => {
        let createdAt = post.createdAt;
        try {
          createdAt = formatDistanceToNow(new Date(post.createdAt), {
            locale: ru,
            addSuffix: true,
          });
        } catch (error) {
          console.error("Ошибка форматирования даты:", error);
        }
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
              <button data-post-id="${post.id}" class="like-button">
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
          </li>`;
      })
      .join("");

    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <ul class="posts">${postsHtml}</ul>
      </div>`;

    console.log("Setting appEl.innerHTML");
    appEl.innerHTML = appHtml;

    console.log("Rendering header component");
    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    for (let userEl of document.querySelectorAll(".post-header")) {
      userEl.addEventListener("click", () => {
        console.log("Navigating to user posts page:", userEl.dataset.userId);
        goToPage(USER_POSTS_PAGE, { userId: userEl.dataset.userId });
      });
    }

    if (user) {
      for (let likeButton of document.querySelectorAll(".like-button")) {
        likeButton.addEventListener("click", () => {
          const postId = likeButton.dataset.postId;
          const post = posts.find((p) => p.id === postId);
          const token = user ? `Bearer ${user.token}` : undefined;

          console.log("Liking/disliking post:", postId);
          const action = post.isLiked ? dislikePost : likePost;
          action({ token, postId })
            .then((updatedPost) => {
              const index = posts.findIndex((p) => p.id === postId);
              posts[index] = updatedPost.post;
              renderPosts();
            })
            .catch((error) => {
              console.error("Ошибка при изменении лайка:", error);
              alert("Ошибка при изменении лайка. Попробуйте снова.");
            });
        });
      }
    }
  };

  renderPosts();
}