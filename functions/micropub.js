import { githubCommitFromAuthenticatedPost } from "./src/github_commit.js";
import { authorizationTokenVerification } from "./src/validate_indieauth_token.js";

// i mentioned in my /about page that i would take the address of the micropub address to my grave.
// funny message 4 the hackers
export async function onRequestGet(context) {
  return new Response("How did you get this address");
}

// handle any POST request in this function
export async function onRequestPost(context) {
  // split out the request and env objects from the context object with destructive assignment
  const { request, env } = context;

  const headers = new Headers();

  // this is currently a test function - it makes a markdown file, thats it -- 2025-06-15
  // const response = githubCommitFromAuthenticatedPost(request, env);

  // Resource is a ReadableStream, with the contents being a url param string
  const formData = await request.formData();

  // make sure we have the bare minimum for a a post (token, content, object type being created (h=entry probably))
  const requiredKeysArr = ["access_token", "content", "h"];
  const hasRequiredKeys = requiredKeysArr.every((item) => formData.has(item));

  if (!hasRequiredKeys) {
    return new Response("Bad Request", { status: 400 });
  }
  let authorized = false;
  try {
    if (env.DEV) {
      authorized = true;
    } else {
      let token = "";
      const formDataToken = formData.get("access_token");
      const headerToken = headers.get("Authorization");
      token = formDataToken ?? "";
      if (!token && headerToken.length) {
        const splitArr = headerToken.split("Bearer ");
        if (splitArr.length > 1) {
          token = splitArr[1];
        }
      }
      if (token) {
        authorized = await authorizationTokenVerification(token);
        return new Response(String(token), { status: 200 });
      } else {
        throw new Error("no token");
      }
      // throw new Error("Token: " + token);
    }
  } catch (e) {
    let keys = "";
    for (const key of formData.keys()) {
      keys += " " + key;
    }
    return new Response("Not Authorized >:^( - token: " + e.message, {
      status: 403,
    });
  }

  if (authorized) {
    return new Response("Success :^)", { status: 200 });
  } else {
    return new Response("Internal Server Error :^(", { status: 500 });
  }
}
