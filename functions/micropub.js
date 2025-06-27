import { githubCommitFromAuthenticatedPost } from "./src/github_commit.js";
import { authorizationTokenVerification } from "./src/validate_indieauth_token.js";
import { generatePostMarkdown } from "./src/generate_post_markdown.js";
import { imagesToUrls } from "./src/images.js";

// i mentioned in my /about page that i would take the address of the micropub address to my grave.
// funny message 4 the hackers
export async function onRequestGet(context) {
  return new Response("How did you get this address");
}

// handle any POST request in this function
export async function onRequestPost(context) {
  // split out the request and env objects from the context object with destructive assignment
  const { request, env } = context;

  // Resource is a ReadableStream, with the contents being a url param string
  const formData = await request.formData();

  // token can either come as a field in the body (access_token=>XXXXXXX)
  // or in the Authorization header (Bearer XXXXXXXXXX)
  let token = "";
  const formDataToken = formData.get("access_token");
  const headerToken = request.headers.get("Authorization");
  token = formDataToken ?? "";
  if (!token && headerToken) {
    const splitArr = headerToken.split("Bearer ");
    if (splitArr.length > 1) {
      token = splitArr[1];
    }
  }

  if (!token) {
    return new Response("Not Authorized >:^(", {
      status: 403,
    });
  }

  // make sure we have the bare minimum for a a post (token, content (or image + alt), object type being created (h=entry probably))
  const requiredKeysArrText = ["content", "h"];
  const requiredKeysArrImage = ["photo", "h"];
  const hasRequiredKeysText = requiredKeysArrText.every((item) =>
    formData.has(item),
  );
  const hasRequiredKeysImage = requiredKeysArrImage.every((item) =>
    formData.has(item),
  );
  let keys = "";
  let keyArr = formData.keys();
  for (const key of keyArr) {
    keys += " " + key;
  }

  if (!hasRequiredKeysText && !hasRequiredKeysImage) {
    return new Response("Bad Request :^O keys:" + keys, {
      status: 400,
    });
  }
  let authorized = false;
  try {
    if (env.DEV) {
      // set DEV=true in .dev.vars on vm (only!) to bypass auth checks for development
      authorized = true;
    } else {
      // otherwise, time to check with indieauth's token endpoint
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
    // for the markdown filename/post link - make a date in the format YYYY-MM-DD_HH-MM-SS
    // i know this is goofy but i don't like JS's built in date/time formats :^)
    let date = new Date();
    let dateString =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      date.getDate().toString().padStart(2, "0") +
      "_" +
      date.getHours().toString().padStart(2, "0") +
      "-" +
      date.getMinutes().toString().padStart(2, "0") +
      "-" +
      date.getSeconds().toString().padStart(2, "0");

    try {
      const title = formData.get("mp-slug");

      const photo = formData.get("photo");
      let imgUrl = "";
      if (photo && photo.name) {
        const r2response = await env.MEDIA_BUCKET.put(photo.name, photo);
        imgUrl = "https://media.zephnet.biz/" + photo.name;
      }

      const content = formData.get("content");
      const postMd = generatePostMarkdown(title, content, imgUrl);

      await githubCommitFromAuthenticatedPost(request, env, postMd, dateString);

      return new Response("Success :^)", {
        status: 202,
        headers: { Location: "https://zephnet.biz/posts/" + dateString },
      });
    } catch (e) {
      return new Response("Internal Server Error :^( error: " + e.message, {
        status: 500,
      });
    }
  } else {
    //  we shouldn'tve gotten here
    return new Response("Internal Server Error :^(", { status: 500 });
  }
}
