export function saveUserToLocalStorage(user) {
  try {
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error saving user to localStorage:", error);
  }
}

export function getUserFromLocalStorage() {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error retrieving user from localStorage:", error);
    return null;
  }
}

export function removeUserFromLocalStorage() {
  localStorage.removeItem("user");
}