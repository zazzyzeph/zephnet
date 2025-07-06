export async function authorizationTokenVerification(token, env) {
  if (env.DEV) {
    // set DEV=true in .dev.vars on vm (only!) to bypass auth checks for development
    return true;
  } else {
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
    if (Object.hasOwn(json, "me") && json.me == "https://zephnet.biz/") {
      return true;
    }
    throw new Error(
      `generic error from authorization function - indieauth did not respond`,
    );
  }
}
