import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";
import { addPost } from "../api.js";
import { goToPage, user, posts } from "../index.js";
import { POSTS_PAGE } from "../routes.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";

  const render = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="form">
          <h3 class="form-title">Добавить пост</h3>
          <div class="form-inputs">
            <div class="upload-image-container"></div>
            <textarea id="description-input" class="textarea" placeholder="Описание поста"></textarea>
            <button class="button" id="add-button">Добавить</button>
          </div>
        </div>
      </div>`;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    const uploadImageContainer = appEl.querySelector(".upload-image-container");
    renderUploadImageComponent({
      element: uploadImageContainer,
      onImageUrlChange(newImageUrl) {
        imageUrl = newImageUrl;
      },
    });

    document.getElementById("add-button").addEventListener("click", () => {
      const description = document.getElementById("description-input").value.trim();
      if (!description) {
        alert("Введите описание поста");
        return;
      }
      if (!imageUrl) {
        alert("Выберите изображение");
        return;
      }

      const token = user ? `Bearer ${user.token}` : undefined;
      addPost({ token, description, imageUrl })
        .then(() => {
          goToPage(POSTS_PAGE); // Переход на страницу постов
        })
        .catch((error) => {
          console.error("Ошибка при добавлении поста:", error);
          alert("Ошибка при добавлении поста. Попробуйте снова.");
        });
    });
  };

  render();
}