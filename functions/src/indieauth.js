export async function tokenFromRequest(request) {
  // the auth token can either come as a field in the request body (form-requests only) (access_token=>XXXXXXX)
  // or it would be in Authorization header (Bearer XXXXXXXXXX) (json request, probably)
  let token = "";
  const headerToken = request.headers.get("Authorization");
  if (headerToken) {
    const splitArr = headerToken.split("Bearer ");
    if (splitArr.length > 1) {
      token = splitArr[1];
    }
  }
  const contentType = request.headers.get("content-type");
  if (!token && contentType.includes("form")) {
    const formData = await request.formData();
    const formToken = formData.get("access_token");
    if (formToken) {
      if (!token) {
        token = formToken;
      }
    }
  }
  return token;
}

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
