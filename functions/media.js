import { authorizationTokenVerification } from "./src/validate_indieauth_token.js";

export async function onRequestGet(context) {
  return new Response("This is my media endpoint.");
}

// handle any POST request in this function
export async function onRequestPost(context) {
  const file = formData.get("file");
  if (file && file.name) {
    allowedTypesArr = ["jpg", "jpeg", "mp4", "mp3"];
    const fileName = file.name;
    const isAllowedExtension = allowedTypesArr.every((ext) =>
      fileName.includes(ext),
    );
    if (isAllowedExtension) {
      const r2response = await env.MEDIA_BUCKET.put(file.name, file);
      imgUrl = "https://media.zephnet.biz/" + file.name;
      return new Response("Success :^)", {
        location: imgUrl,
        status: 201,
      });
    }
  }
  return new Response("Bad Request :^O", {
    status: 400,
  });
}
