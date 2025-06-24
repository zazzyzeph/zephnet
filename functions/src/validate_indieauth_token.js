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
  if (Object.hasOwn(json, "me") && json.me == "https://zephnet.biz") {
    return true;
  }
  return false;
}
