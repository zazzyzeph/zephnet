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

  // this is currently a test function - it makes a markdown file, thats it -- 2025-06-15
  // const response = githubCommitFromAuthenticatedPost(request, env);

  // Resource is a ReadableStream, with the contents being a url param string
  let text = await request.text();
  let params = new URLSearchParams(text);

  // make sure we have the bare minimum for a a post (token, content, object type being created (h=entry probably))
  const requiredKeysArr = ["access_token", "content", "h"];
  const hasRequiredKeys = requiredKeysArr.every((item) => params.has(item));

  if (!hasRequiredKeys) {
    return new Response("Bad Request: " + params.toString(), { status: 400 });
  }
  try {
    let authorized = false;
    if (env.DEV) {
      authorized = true;
    } else {
      authorized = await authorizationTokenVerification(
        params.get("access_token"),
      );
    }
  } catch (e) {
    return new Response("Not Authorized >:^(", {
      status: 403,
    });
  }

  if (authorized) {
    return new Response("Success :^)", { status: 200 });
  }
  return new Response("Internal Server Error :^(", { status: 500 });
}
