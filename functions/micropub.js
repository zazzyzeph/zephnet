import { githubCommitFromAuthenticatedPost } from "./src/github_commit.js";
import { authorizationTokenVerification } from "./src/validate_indieauth_token.js";
import { generatePostMarkdown } from "./src/generate_post_markdown.js";

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

  // Resource is a ReadableStream, with the contents being a url param string
  const formData = await request.formData();

  // make sure we have the bare minimum for a a post (token, content (or image + alt), object type being created (h=entry probably))
  const requiredKeysArrText = ["access_token", "content", "h"];
  const requiredKeysArrImage = ["access_token", "photo", "h"];
  const hasRequiredKeysText = requiredKeysArrText.every((item) =>
    formData.has(item),
  );
  const hasRequiredKeysImage = requiredKeysArrImage.every((item) =>
    formData.has(item),
  );

  if (!hasRequiredKeysText && !hasRequiredKeysImage) {
    return new Response("Bad Request :^O", { status: 400 });
  }
  let authorized = false;
  try {
    if (env.DEV) {
      // set DEV=true in .dev.vars on vm (only!) to bypass auth checks for development
      authorized = true;
    } else {
      // otherwise, time to check with indieauth's token endpoint
      // token can either come as a field in the body (access_token=>XXXXXXX)
      // or in the Authorization header (Bearer XXXXXXXXXX)
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
      } else {
        throw new Error("no token");
      }
    }
  } catch (e) {
    return new Response("Not Authorized >:^( - error: " + e.message, {
      status: 403,
    });
  }

  if (authorized) {
    try {
      const title = formData.get("mp-slug");
      const content = formData.get("content");
      const postMd = generatePostMarkdown(title, content);
      await githubCommitFromAuthenticatedPost(request, env, postMd);
    } catch (e) {
      return new Response("Internal Server Error :^( error: " + e.message, {
        status: 500,
      });
    }
    return new Response("Success :^)", { status: 200 });
  } else {
    return new Response("Internal Server Error :^(", { status: 500 });
  }
}
