import { githubCommitFromAuthenticatedPost } from "./src/github_commit.js";
import { authorizationTokenVerification } from "./src/validate_indieauth_token.js";
import { generatePostMarkdown } from "./src/generate_post_markdown.js";
// import { imagesToUrls } from "./src/images.js";
import { formToJson } from "./src/form_to_json.js";
import { dateString } from "./src/datestring.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  let token = "";
  const headerToken = request.headers.get("Authorization");
  if (headerToken) {
    const splitArr = headerToken.split("Bearer ");
    if (splitArr.length > 1) {
      token = splitArr[1];
    }
  }
  if (!token) {
    return new Response("Unauthorized >:^( who told you where I live", {
      status: 401,
    });
  }
  // AUTHORIZATION
  let authorized = false;
  try {
    authorized = await authorizationTokenVerification(token, env);
  } catch (e) {
    return new Response("Forbidden >:^( - error: " + e.message, {
      status: 403,
    });
  }
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  if (!q) {
    return new Response("Bad Request :^O", {
      status: 400,
    });
  }
  const json = {
    "media-endpoint": "https://zephnet.biz/media",
  };
  return new Response(JSON.stringify(json), {
    headers: {
      "content-type": "application/json",
    },
    status: 200,
  });
}

export async function onRequestPost(context) {
  // split out the request and env objects from the context object with destructive assignment
  const { request, env } = context;
  let token = "";

  // the auth token can either come as a field in the request body (form-requests only) (access_token=>XXXXXXX)
  // or it would be in Authorization header (Bearer XXXXXXXXXX) (json request, probably)
  const headerToken = request.headers.get("Authorization");
  if (headerToken) {
    const splitArr = headerToken.split("Bearer ");
    if (splitArr.length > 1) {
      token = splitArr[1];
    }
  }

  // detect if we're dealing with a json request or some type of form-*
  const contentType = request.headers.get("content-type");
  // populate the request body as a relatively uniform json object
  let body = {};
  if (contentType.includes("application/json")) {
    body = JSON.stringify(await request.json());
  } else if (contentType.includes("form")) {
    // lets push all the formData into a json object, to keep things relatively consistent
    const formData = await request.formData();
    const formToken = formData.get("access_token");
    if (formToken) {
      if (!token) {
        token = formToken;
      }
      formData.delete("access_token");
    }
    body = formToJson(formData);
  } else {
    // we didn't get an appropriate content type. that's a bad request!
    return new Response("Bad Request :^O", {
      status: 400,
    });
  }

  // by now the token var should be populated
  if (!token) {
    return new Response("Forbidden >:^(", {
      status: 403,
    });
  }

  // make sure we have the bare minimum for a a post (token, content (or image + alt), object type being created (h=entry or h=event probably))
  // TODO this is busted with the json switch! also split this into a new js function file
  const requiredKeysArrText = ["content", "h"];
  const requiredKeysArrImage = ["photo", "h"];
  const hasRequiredKeysText = requiredKeysArrText.every(
    (item) => item in body.properties,
  );
  const hasRequiredKeysImage = requiredKeysArrImage.every(
    (item) => item in body.properties,
  );

  if (!hasRequiredKeysText && !hasRequiredKeysImage) {
    return new Response("Bad Request :^O", {
      status: 400,
    });
  }

  // AUTHORIZATION
  let authorized = false;
  try {
    authorized = await authorizationTokenVerification(token, env);
  } catch (e) {
    return new Response("Forbidden >:^( - error: " + e.message, {
      status: 403,
    });
  }

  if (authorized) {
    // for the markdown filename/post link - make a date in the format YYYY-MM-DD_HH-MM-SS
    // i know this is goofy but i don't like JS's built in date/time formats :^)
    let date = new Date();
    let dateString = dateString();

    try {
      if (body["h"] == "entry") {
        const title = body["mp-slug"];
        const photo = body["photo"];
        const photoFile = body["photo"].name;
        body["photoFile"] = photoFile;
        let imgUrl = null;

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
