import { githubCommitFromAuthenticatedPost } from "./src/github_commit.js";
import {
  tokenFromRequest,
  authorizationTokenVerification,
} from "./src/indieauth.js";
import { generateEntryMarkdown } from "./src/generate_entry_markdown.js";
import { generateEventMarkdown } from "./src/generate_event_markdown.js";
// import { imagesToUrls } from "./src/images.js";
import { formToJson } from "./src/form_to_json.js";
import { dateStringFromDate } from "./src/datestring.js";
import { validateFields } from "./src/validate_fields.js";
import { storeToDb } from "./src/store_to_db.js";
import { remove, removeMultiple } from "./src/vendor/exifremove.js";
import { mpErrorResponse } from "./src/error_responses.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const token = await tokenFromRequest(request);
  if (!token) {
    return mpErrorResponse(400);
  }
  // AUTHORIZATION
  let authorized = false;
  try {
    authorized = await authorizationTokenVerification(token, env);
  } catch (e) {
    return mpErrorResponse(403);
  }
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  if (!q) {
    return mpErrorResponse(400);
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
  const { request, env } = context;
  const token = await tokenFromRequest(request);
  // detect if we're dealing with a json request or some type of form-*
  const contentType = request.headers.get("content-type");
  // we want to standardize on the micropub json standard - converting a form-encoded request to json as needed
  let body = {};
  if (contentType.includes("application/json")) {
    body = await request.json();
  } else if (contentType.includes("form")) {
    let formData = await request.formData();
    body = formToJson(formData);
  } else {
    // we didn't get an appropriate content type. that's a bad request!
    return mpErrorResponse(400);
  }

  // by now the token var should be populated
  if (!token) {
    return mpErrorResponse(403);
  }

  // make sure we have the bare minimum for a a post (token, content (or image + alt), object type being created (h=entry or h=event probably))
  try {
    validateFields(body);
  } catch (e) {
    return mpErrorResponse(400);
  }

  // AUTHORIZATION
  let authorized = false;
  try {
    authorized = await authorizationTokenVerification(token, env);
  } catch (e) {
    return mpErrorResponse(403);
  }

  if (authorized) {
    // for the markdown filename/post link - make a date in the format YYYY-MM-DD_HH-MM-SS
    // i know this is goofy but i don't like JS's built in date/time formats :^)
    const date = new Date();
    const dateString = dateStringFromDate(date);

    try {
      const type = body["type"];
      const props = body["properties"];
      let postMd = "";
      if (type == "h-entry" || type == "h-event") {
        if (type == "h-entry") {
          if (props["photo"]) {
            return new Response(JSON.stringify(props), {
              status: 400,
            })
            return mpErrorResponse(400);
          }
          postMd = generateEntryMarkdown(props, dateString);
        }
        if (type == "h-event") {
          postMd = generateEventMarkdown(props);
        }

        // for debugging in production :) from micropub clients (quill is the only thing i post with atm)
        // return new Response(JSON.stringify(body), {
        //   status: 500,
        // });

        // if we're on dev, pretend that we made a post and return the markdown :^)
        if (env.DEV) {
          return new Response(postMd, {
            status: 202,
            headers: { Location: "https://zephnet.biz/posts/" + dateString },
          });
        }
        await githubCommitFromAuthenticatedPost(env, postMd, dateString);

        return new Response("Success :^)", {
          status: 202,
          headers: { Location: "https://zephnet.biz/posts/" + dateString },
        });
      }
      return mpErrorResponse(500);
    } catch (e) {
      return mpErrorResponse(500, env, e);
    }
  } else {
    //  we shouldn'tve gotten here
    return mpErrorResponse(500);
  }
}
