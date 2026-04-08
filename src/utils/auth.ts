export const getAuthCode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
};

export const getAccessToken = async (code: string) => {
  const res = await fetch("http://localhost:5000/get-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  return res.json();
};

export const getWsUrl = async (token: string) => {
  const res = await fetch(`http://localhost:5000/ws-url?token=${token}`);
  const data = await res.json();
  return data.data.authorized_redirect_uri;
};

export const logout = () => {
  localStorage.removeItem("upstox_token");
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  window.history.replaceState({}, document.title, url.pathname);
  window.location.reload();
};
