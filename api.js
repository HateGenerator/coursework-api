const personalKey = "prod";
const baseHost = "https://wedev-api.sky.pro";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
  console.log("getPosts called with token:", token);
  const headers = {};
  if (token && token !== "Bearer undefined") {
    headers.Authorization = token;
  }
  return fetch(postsHost, {
    method: "GET",
    headers,
  })
    .then((response) => {
      console.log("getPosts response status:", response.status);
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Ошибка сервера: ${response.status} ${text}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("getPosts data:", data);
      return data.posts;
    });
}

export function getUserPosts({ token, userId }) {
  console.log("getUserPosts called with token:", token, "userId:", userId);
  const headers = {};
  if (token && token !== "Bearer undefined") {
    headers.Authorization = token;
  }
  return fetch(`${postsHost}/user-posts/${userId}`, {
    method: "GET",
    headers,
  })
    .then((response) => {
      console.log("getUserPosts response status:", response.status);
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Ошибка сервера: ${response.status} ${text}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("getUserPosts data:", data);
      return data.posts;
    });
}

export function addPost({ token, description, imageUrl }) {
  console.log("addPost called with:", { token, description, imageUrl });

  if (!description || !imageUrl) {
    throw new Error("Описание или URL изображения не переданы");
  }

  return fetch(postsHost, {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify({
      description,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      return response.json().then((data) => {
        throw new Error(data.error || "Некорректные данные поста");
      });
    }
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    return response.json();
  });
}

export function likePost({ token, postId }) {
  console.log("likePost called with:", { token, postId });
  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      console.log("likePost response status:", response.status);
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      return response.json();
    });
}

export function dislikePost({ token, postId }) {
  console.log("dislikePost called with:", { token, postId });
  return fetch(`${postsHost}/${postId}/dislike`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      console.log("dislikePost response status:", response.status);
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      return response.json();
    });
}

export function registerUser({ login, password, name, imageUrl }) {
  const body = {
    login,
    password,
    name,
  };

  if (imageUrl) {
    body.imageUrl = imageUrl;
  }

  return fetch("https://wedev-api.sky.pro/api/user", {
    method: "POST",
    body: JSON.stringify(body),
  }).then((response) => {
    if (response.status === 400) {
      return response.json().then((data) => {
        throw new Error(data.error || "Ошибка регистрации");
      });
    }
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      return response.json().then((data) => {
        throw new Error(data.error || "Неверный логин или пароль");
      });
    }
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    return response.json();
  });
}

export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error("Ошибка загрузки изображения");
    }
    return response.json();
  });
}

export function verifyToken({ token }) {
  console.log("verifyToken called with:", token);
  return fetch(baseHost + "/api/user/me", {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      console.log("verifyToken response status:", response.status);
      return response.status === 200;
    })
    .catch((error) => {
      console.error("verifyToken error:", error);
      return false;
    });
}
