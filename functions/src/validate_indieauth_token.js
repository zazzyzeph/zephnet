export async function authorizationTokenVerification(token) {
  const response = await fetch("https://tokens.indieauth.com/token", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const json = await response.json();
  if (json.hasOwnProperty("me")) {
    return true;
  }
  return false;
}
