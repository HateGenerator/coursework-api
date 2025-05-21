import { getPosts, getUserPosts, } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];

const getToken = () => {
  const token = user && user.token ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};


export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      renderApp();
      return;
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error("Error fetching posts:", error);
          page = POSTS_PAGE;
          posts = [];
          renderApp();
          const appEl = document.getElementById("app");
          const errorEl = document.createElement("div");
          errorEl.className = "error-message";
          errorEl.textContent = `Не удалось загрузить посты: ${error.message}. Попробуйте позже.`;
          appEl.appendChild(errorEl);
        });
      return;
    }

    if (newPage === USER_POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      getUserPosts({ token: getToken(), userId: data.userId })
        .then((newPosts) => {
          page = USER_POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error("Error fetching user posts:", error);
          page = POSTS_PAGE;
          posts = [];
          renderApp();
          const appEl = document.getElementById("app");
          const errorEl = document.createElement("div");
          errorEl.className = "error-message";
          errorEl.textContent = `Не удалось загрузить посты пользователя: ${error.message}. Попробуйте позже.`;
          appEl.appendChild(errorEl);
        });
      return;
    }

    page = newPage;
    renderApp();
    return;
  }

  console.error("Unknown page:", newPage);
  const appEl = document.getElementById("app");
  appEl.innerHTML = `<div class="page-container">Ошибка: неизвестная страница</div>`;
};

const renderApp = () => {
  const appEl = document.getElementById("app");

  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        goToPage(POSTS_PAGE);
      },
    });
  }

  if (page === POSTS_PAGE || page === USER_POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    });
  }

  appEl.innerHTML = `<div class="page-container">Ошибка: неизвестная страница</div>`;
};

goToPage(POSTS_PAGE);