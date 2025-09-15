import {
  authorizationTokenVerification,
  tokenFromRequest,
} from "./src/indieauth.js";
import { mpErrorResponse } from "./src/error_responses.js";

export async function onRequestGet(context) {
  return new Response("This is my media endpoint. No funny business please.");
}

// handle any POST or PUT request
export async function onRequest(context) {
  const { request, env } = context;
  if (["PUT", "POST"].includes(request.method)) {
    const { request, env } = context;
    const token = await tokenFromRequest(request);
    if (!token) {
      return mpErrorResponse(401);
    }
    // AUTHORIZATION
    let authorized = false;
    try {
      authorized = await authorizationTokenVerification(token, env);
    } catch (e) {
      return mpErrorResponse(403);
    }
    const formData = await request.formData();
    const file = formData.get("file");
    if (file && file.name && file.type) {
      const allowedMimeTypesArr = ["audio/mpeg", "image/jpeg", "video/mp4"];
      if (allowedMimeTypesArr.includes(file.type)) {
        const r2response = await env.MEDIA_BUCKET.put(file.name, file);
        const imgUrl = "https://media.zephnet.biz/" + file.name;
        return new Response("Success :^)", {
          location: imgUrl,
          status: 201,
        });
      }
    }
    return mpErrorResponse(400);
  }
}
