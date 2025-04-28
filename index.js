console.log("Starting index.js");
import { getPosts, getUserPosts, verifyToken } from "./api.js";
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

console.log("Initial state:", { user, page, posts });

const getToken = () => {
  const token = user && user.token ? `Bearer ${user.token}` : undefined;
  console.log("getToken called, token:", token);
  return token;
};

export const logout = () => {
  console.log("Logging out");
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

// Проверка токена при старте
if (user && user.token) {
  console.log("Verifying token at startup...");
  verifyToken({ token: `Bearer ${user.token}` })
    .then((isValid) => {
      if (!isValid) {
        console.log("Invalid token, logging out");
        logout();
      }
    })
    .catch((error) => {
      console.error("Token verification error:", error);
      logout();
    });
}

export const goToPage = (newPage, data) => {
  console.log("goToPage called with:", { newPage, data });
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
      console.log("Navigating to ADD_POSTS_PAGE, user:", user);
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      renderApp();
      return;
    }

    if (newPage === POSTS_PAGE) {
      console.log("Navigating to POSTS_PAGE");
      page = LOADING_PAGE;
      renderApp();

      console.log("Fetching posts...");
      getPosts({ token: getToken() })
        .then((newPosts) => {
          console.log("Posts fetched:", newPosts);
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
      console.log("Navigating to USER_POSTS_PAGE with userId:", data?.userId);
      page = LOADING_PAGE;
      renderApp();

      console.log("Fetching user posts...");
      getUserPosts({ token: getToken(), userId: data.userId })
        .then((newPosts) => {
          console.log("User posts fetched:", newPosts);
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

    console.log("Navigating to page:", newPage);
    page = newPage;
    renderApp();
    return;
  }

  console.error("Unknown page:", newPage);
  const appEl = document.getElementById("app");
  appEl.innerHTML = `<div class="page-container">Ошибка: неизвестная страница</div>`;
};

const renderApp = () => {
  console.log("renderApp called, current page:", page);
  const appEl = document.getElementById("app");
  console.log("appEl:", appEl);

  if (page === LOADING_PAGE) {
    console.log("Rendering LOADING_PAGE");
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    console.log("Rendering AUTH_PAGE");
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        console.log("Setting new user:", newUser);
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    console.log("Rendering ADD_POSTS_PAGE");
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        console.log("Adding post:", { description, imageUrl });
        goToPage(POSTS_PAGE);
      },
    });
  }

  if (page === POSTS_PAGE || page === USER_POSTS_PAGE) {
    console.log("Rendering POSTS_PAGE or USER_POSTS_PAGE, posts:", posts);
    return renderPostsPageComponent({
      appEl,
    });
  }

  console.error("Unknown page:", page);
  appEl.innerHTML = `<div class="page-container">Ошибка: неизвестная страница</div>`;
};

console.log("Calling initial goToPage(POSTS_PAGE)");
goToPage(POSTS_PAGE);