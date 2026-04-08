export const redirectToLogin = async () => {
  const res = await fetch("http://localhost:5000/login-url");
  const data = await res.json();
  window.location.href = data.url;
};
