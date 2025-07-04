import { githubCommitFromAuthenticatedPost } from "./src/github_commit.js";
import { authorizationTokenVerification } from "./src/validate_indieauth_token.js";
import { generatePostMarkdown } from "./src/generate_post_markdown.js";
import { imagesToUrls } from "./src/images.js";
import { formToJson } from "./src/form_to_json.js";

// i mentioned in my /about page that i would take the address of the micropub address to my grave.
// funny message 4 the hackers
export async function onRequestGet(context) {
  return new Response("How did you get this address");
}

// handle any POST request in this function
export async function onRequestPost(context) {
  // split out the request and env objects from the context object with destructive assignment
  const { request, env } = context;
  let token = "";
  let body = {};

  // detect if we're dealing with a json request or some type of form-*
  const contentType = request.headers.get("content-type");
  // populate the request body as a relatively uniform json object
  if (contentType.includes("application/json")) {
    body = JSON.stringify(await request.json());
  } else if (contentType.includes("form")) {
    // lets push all the formData into a json object, to keep things relatively consistent
    const formData = await request.formData();
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1];
    }
    // if we have access_token, set it as the auth token
    token = formData.get("access_token");
  } else {
    // we didn't get an appropriate content type. that's a bad request!
    return new Response("Bad Request :^O", {
      status: 400,
    });
  }

  // token can either come as a field in the request body and might already be set by the above code (form-types only) (access_token=>XXXXXXX)
  // otherwise it'd be in the Authorization header (Bearer XXXXXXXXXX) (json request, probably)
  // but in theory it could be both
  if (!token) {
    const headerToken = request.headers.get("Authorization");
    if (!token && headerToken) {
      const splitArr = headerToken.split("Bearer ");
      if (splitArr.length > 1) {
        token = splitArr[1];
      }
    }
  }

  // by now the token var should be set
  if (!token) {
    return new Response("Not Authorized >:^(", {
      status: 403,
    });
  }

  // make sure we have the bare minimum for a a post (token, content (or image + alt), object type being created (h=entry or h=event probably))
  const requiredKeysArrText = ["content", "h"];
  const requiredKeysArrImage = ["photo", "h"];
  const hasRequiredKeysText = requiredKeysArrText.every((item) => item in body);
  const hasRequiredKeysImage = requiredKeysArrImage.every(
    (item) => item in body,
  );

  if (!hasRequiredKeysText && !hasRequiredKeysImage) {
    return new Response("Bad Request :^O", {
      status: 400,
    });
  }

  // AUTHORIZATION
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
      if (body["h"] == "entry") {
        const title = body["mp-slug"];
        const photo = body["photo"];
        const photoFile = body["photo"].name;
        body["photoFile"] = photoFile;
        let imgUrl = null;
        if (photo && photo.name) {
          const r2response = await env.MEDIA_BUCKET.put(photo.name, photo);
          imgUrl = "https://media.zephnet.biz/" + photo.name;
        }

        const content = body["content"];
        const postMd = generatePostMarkdown(title, content, imgUrl);

        // for debugging in production :) from micropub clients (quill is the only thing i post with atm)
        // return new Response(JSON.stringify(body), {
        //   status: 500,
        // });
        await githubCommitFromAuthenticatedPost(
          request,
          env,
          postMd,
          dateString,
        );

        return new Response("Success :^)", {
          status: 202,
          headers: { Location: "https://zephnet.biz/posts/" + dateString },
        });
      }
      return new Response("Internal Server Error :^(" + e.message, {
        status: 500,
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
