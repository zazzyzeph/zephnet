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
  const hasAllKeys = requiredKeysArr.every((item) => params.has(item));

  if (!hasAllKeys) {
    return new Response("Bad Request", { status: 400 });
  }
  try {
    const authorized = await authorizationTokenVerification(
      params.get("access_token"),
    );
    if (authorized) {
      return new Response("Success!", { status: 200 });
    }
  } catch (e) {
    return new Response("busted :^(", { status: 500 });
  }

  return new Response("Not Authorized >:^( params: " + params.toString(), {
    status: 403,
  });
  // return new Response("Not Authorized >:^(", { status: 403 });
}
