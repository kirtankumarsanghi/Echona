export const isLoggedIn = () => {
  return localStorage.getItem("echona_token") ? true : false;
};

export const login = (token) => {
  localStorage.setItem("echona_token", token);
};

export const logout = () => {
  localStorage.removeItem("echona_token");
};
