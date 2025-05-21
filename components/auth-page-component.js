import { renderHeaderComponent } from "./header-component.js";
import { loginUser, registerUser, uploadImage } from "../api.js";

export function renderAuthPageComponent({ appEl, setUser, user, goToPage }) {
  let isLoginMode = true;
  let imageUrl = ""; // будет заполнено при загрузке изображения

  const renderForm = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="form">
          <h3 class="form-title">${isLoginMode ? "Вход в Instapro" : "Регистрация в Instapro"}</h3>
          <div class="form-inputs">
            ${!isLoginMode ? `
              <div class="form-field">
                <label>Имя</label>
                <input type="text" id="name-input" class="input" placeholder="Имя" />
              </div>
              <div class="form-field">
                <label>Фото профиля</label>
                <input type="file" id="image-input" class="input" accept="image/*" />
              </div>
            ` : ""}
            <div class="form-field">
              <label>Логин</label>
              <input type="text" id="login-input" class="input" placeholder="Логин" />
            </div>
            <div class="form-field">
              <label>Пароль</label>
              <input type="password" id="password-input" class="input" placeholder="Пароль" />
            </div>
            <div class="form-error"></div>
            <button class="button" id="${isLoginMode ? "login-button" : "register-button"}">
              ${isLoginMode ? "Войти" : "Зарегистрироваться"}
            </button>
          </div>
          <div class="form-buttons">
            <button class="button button--link" id="toggle-button">
              ${isLoginMode ? "Зарегистрироваться" : "Войти"}
            </button>
          </div>
        </div>
      </div>`;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
      user,
      goToPage,
    });

    const loginInputElement = document.getElementById("login-input");
    const passwordInputElement = document.getElementById("password-input");
    const nameInputElement = document.getElementById("name-input");
    const imageInputElement = document.getElementById("image-input");
    const registerButtonElement = document.getElementById("register-button");
    const loginButtonElement = document.getElementById("login-button");
    const toggleButtonElement = document.getElementById("toggle-button");
    const authErrorMessageElement = document.querySelector(".form-error");

    const setError = (message) => {
      if (authErrorMessageElement) {
        authErrorMessageElement.textContent = message;
      }
    };

    toggleButtonElement.addEventListener("click", () => {
      isLoginMode = !isLoginMode;
      imageUrl = "";
      setError(""); // Сбрасываем ошибку при смене формы
      renderForm();
    });

    if (loginButtonElement) {
      loginButtonElement.addEventListener("click", () => {
        setError("");

        const login = loginInputElement?.value?.trim() || "";
        const password = passwordInputElement?.value?.trim() || "";

        if (!login) {
          setError("Введите логин");
          return;
        }

        if (!password) {
          setError("Введите пароль");
          return;
        }

        loginUser({ login, password })
          .then((userData) => {
            if (!userData.user?.token) {
              throw new Error("Токен не получен");
            }
            setUser(userData.user);
          })
          .catch((error) => {
            setError(error.message);
          });
      });
    }

    if (registerButtonElement) {
      registerButtonElement.addEventListener("click", () => {
        setError("");

        const login = loginInputElement?.value?.trim() || "";
        const password = passwordInputElement?.value?.trim() || "";
        const name = nameInputElement?.value?.trim() || "";

        if (!login) {
          setError("Введите логин");
          return;
        }

        if (!password) {
          setError("Введите пароль");
          return;
        }

        if (!name) {
          setError("Введите имя");
          return;
        }

        const data = {
          login,
          password,
          name,
        };

        if (imageUrl) {
          data.imageUrl = imageUrl;
        }

        registerUser(data)
          .then((userData) => {
            if (!userData.user?.token) {
              throw new Error("Токен не получен");
            }
            setUser(userData.user);
          })
          .catch((error) => {
            setError(error.message);
          });
      });
    }

    if (imageInputElement) {
      imageInputElement.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
          imageInputElement.disabled = true;
          setError("Загрузка изображения...");
          uploadImage({ file })
            .then((data) => {
              imageUrl = data.fileUrl;
              setError("");
              imageInputElement.disabled = false;
            })
            .catch(() => {
              setError("Ошибка загрузки изображения");
              imageInputElement.disabled = false;
            });
        }
      });
    }
  };

  renderForm();
}