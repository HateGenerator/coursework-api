import { renderHeaderComponent } from "./header-component.js";
import { loginUser, registerUser, uploadImage } from "../api.js";

export function renderAuthPageComponent({ appEl, setUser, user, goToPage }) {
  console.log("renderAuthPageComponent called");
  let isLoginMode = true;
  let imageUrl = "";

  const renderForm = () => {
    console.log("Rendering auth form, isLoginMode:", isLoginMode);
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
    const loginButtonElement = document.getElementById("login-button");
    const registerButtonElement = document.getElementById("register-button");
    const toggleButtonElement = document.getElementById("toggle-button");
    const authErrorMessageElement = document.querySelector(".form-error");

    console.log("Form elements:", {
      loginInputElement,
      passwordInputElement,
      nameInputElement,
      imageInputElement,
      loginButtonElement,
      registerButtonElement,
      toggleButtonElement,
      authErrorMessageElement,
    });

    const setError = (message) => {
      if (authErrorMessageElement) {
        authErrorMessageElement.textContent = message;
      } else {
        console.error("authErrorMessageElement not found");
      }
    };

    if (toggleButtonElement) {
      toggleButtonElement.addEventListener("click", () => {
        console.log("Toggle button clicked, switching to isLoginMode:", !isLoginMode);
        isLoginMode = !isLoginMode;
        imageUrl = "";
        renderForm();
      });
    }

    if (loginButtonElement) {
      loginButtonElement.addEventListener("click", () => {
        console.log("Login button in form clicked");
        setError("");

        const login = loginInputElement?.value?.trim();
        const password = passwordInputElement?.value?.trim();

        if (!login) {
          setError("Введите логин");
          return;
        }

        if (!password) {
          setError("Введите пароль");
          return;
        }

        console.log("Attempting login with:", { login, password });
        loginUser({ login, password })
          .then((userData) => {
            console.log("Login successful, user:", userData);
            if (!userData.user?.token) {
              throw new Error("Токен не получен");
            }
            setUser(userData.user);
          })
          .catch((error) => {
            console.error("Login error:", error);
            setError(error.message);
          });
      });
    }

    if (registerButtonElement) {
      registerButtonElement.addEventListener("click", () => {
        console.log("Register: Button clicked");
        setError("");
    
        const login = loginInputElement?.value?.trim() || "";
        const password = passwordInputElement?.value?.trim() || "";
        const name = nameInputElement?.value?.trim() || "";
    
        console.log("Register: Input values:", { login, password, name, imageUrl });
        console.log("Register: Input types:", {
          loginType: typeof login,
          passwordType: typeof password,
          nameType: typeof name,
          imageUrlType: typeof imageUrl,
        });
    
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
    
        console.log("Register: Attempting registration with:", { login, password, name, imageUrl });
        registerUser({
          login,
          password,
          name,
          imageUrl,
        })
          .then((userData) => {
            console.log("Register: Registration successful, user:", userData);
            if (!userData.user?.token) {
              throw new Error("Токен не получен");
            }
            setUser(userData.user);
          })
          .catch((error) => {
            console.error("Register: Error:", error);
            setError(error.message);
          });
      });
    }

    if (imageInputElement) {
      imageInputElement.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
          console.log("Selected image file:", file.name);
          imageInputElement.disabled = true;
          setError("Загрузка изображения...");
          uploadImage({ file })
            .then((data) => {
              imageUrl = data.fileUrl;
              console.log("Image uploaded, URL:", imageUrl);
              setError("");
              imageInputElement.disabled = false;
            })
            .catch((error) => {
              console.error("Image upload error:", error);
              setError("Ошибка загрузки изображения");
              imageInputElement.disabled = false;
            });
        }
      });
    }
  };

  renderForm();
}