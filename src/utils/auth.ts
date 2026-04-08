export const getAuthCode = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
};

export const logout = () => {
  localStorage.removeItem("access_token");
  // Clear URL params
  const url = new URL(window.location.href);
  url.search = "";
  window.location.href = url.toString();
};
