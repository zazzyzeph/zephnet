import { githubCommitFromAuthenticatedPost } from "./src/github_commit.js";
import { authorizationTokenVerification } from "./src/validate_indieauth_token.js";
import { generateEntryMarkdown } from "./src/generate_entry_markdown.js";
import { generateEventMarkdown } from "./src/generate_event_markdown.js";
// import { imagesToUrls } from "./src/images.js";
import { formToJson } from "./src/form_to_json.js";
import { dateStringFromDate } from "./src/datestring.js";
import { validateFields } from "./src/validate_fields.js";
import { storeToDb } from "./src/store_to_db.js";
import { remove, removeMultiple } from "./src/vendor/exifremove.js";

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
    body = await request.json();
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
  try {
    validateFields(body);
  } catch (e) {
    return new Response("Bad Request :^O error: " + e.message, {
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
    const date = new Date();
    const dateString = dateStringFromDate(date);

    try {
      const type = body["type"];
      const props = body["properties"];
      let postMd = "";
      if (type == "h-entry" || type == "h-event") {
        if (type == "h-entry") {
          if (props["photo"] && props["photo"].hasOwnProperty("name")) {
            return new Response(
              "Bad Request :^O error: the photo should be a url",
              {
                status: 400,
              },
            );
          }
          postMd = generateEntryMarkdown(props);
          return new Response(postMd, {
            status: 400,
          });
        }
        if (type == "h-event") {
          postMd = generateEventMarkdown(props);
          return new Response(postMd, {
            status: 400,
          });
        }

        // for debugging in production :) from micropub clients (quill is the only thing i post with atm)
        // return new Response(JSON.stringify(body), {
        //   status: 500,
        // });

        // const donk = await storeToDb(env, props, type, dateString);
        // return new Response(JSON.stringify(donk), {
        //   status: 202,
        //   headers: { Location: "https://zephnet.biz/posts/" + dateString },
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
