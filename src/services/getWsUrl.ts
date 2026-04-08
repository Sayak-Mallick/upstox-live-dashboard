export const fetchWsUrl = async (token: string) => {
  const res = await fetch(`http://localhost:5000/ws-url?token=${token}`);

  const data = await res.json();
  return data.data.authorized_redirect_uri;
};
