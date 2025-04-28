export function saveUserToLocalStorage(user) {
  try {
    console.log("Saving user to localStorage:", user);
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error saving user to localStorage:", error);
  }
}

export function getUserFromLocalStorage() {
  try {
    const user = localStorage.getItem("user");
    console.log("Retrieved user from localStorage:", user);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error retrieving user from localStorage:", error);
    return null;
  }
}

export function removeUserFromLocalStorage() {
  console.log("Removing user from localStorage");
  localStorage.removeItem("user");
}