const personalKey = "prod";
const baseHost = "https://webdev-hw-api.vercel.app";
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
  return fetch(postsHost, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description, imageUrl }),
  })
    .then((response) => {
      console.log("addPost response status:", response.status);
      if (response.status === 400) {
        throw new Error("Некорректные данные поста");
      }
      if (response.status === 401) {
        throw new Error("Нет авторизации");
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
  console.log("registerUser: Function called");
  console.log("registerUser: Raw input values:", { login, password, name, imageUrl });
  console.log("registerUser: Input types:", {
    loginType: typeof login,
    passwordType: typeof password,
    nameType: typeof name,
    imageUrlType: typeof imageUrl,
  });

  // Очистка данных
  const cleanLogin = (login || "").trim();
  const cleanPassword = (password || "").trim();
  const cleanName = (name || "").trim();

  // Валидация
  if (!cleanLogin) {
    throw new Error("Логин обязателен");
  }
  if (!cleanPassword) {
    throw new Error("Пароль обязателен");
  }
  if (!cleanName) {
    throw new Error("Имя обязательно");
  }

  // Формирование тела запроса
  const body = {
    login: cleanLogin,
    password: cleanPassword,
    name: cleanName,
    imageUrl: (imageUrl || null)?.trim(), // Обработка imageUrl
  };

  console.log("registerUser: Sending request body:", JSON.stringify(body, null, 2));

  return fetch(baseHost + "/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => {
      console.log("registerUser: Response status:", response.status);
      if (response.status === 400) {
        return response.json().then((data) => {
          console.log("registerUser: Error response:", data);
          throw new Error(data.error || "Ошибка регистрации");
        });
      }
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("registerUser: Error:", error);
      throw error;
    });
}

export function loginUser({ login, password }) {
  console.log("loginUser called with:", { login, password });
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login,
      password,
    }),
  })
    .then((response) => {
      console.log("loginUser response status:", response.status);
      if (response.status === 400) {
        return response.json().then((data) => {
          throw new Error(data.error || "Неверный логин или пароль");
        });
      }
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("loginUser error:", error);
      throw error;
    });
}

export function uploadImage({ file }) {
  console.log("uploadImage called with file:", file.name);
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  })
    .then((response) => {
      console.log("uploadImage response status:", response.status);
      if (response.status !== 200) {
        throw new Error("Ошибка загрузки изображения");
      }
      return response.json();
    })
    .then((data) => {
      console.log("uploadImage data:", data);
      return data; // Возвращаем весь объект { fileUrl }
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