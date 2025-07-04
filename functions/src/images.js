export async function imagesToUrls(env, photo, dateString) {
  // this doesn't do anything for now, we're sending files straight to our cloudflare r2 bucket
  const cloudflare_account_id = env.CLOUDFLARE_ACCOUNT_ID;
  const cloudflare_images_token = env.CLOUDFLARE_IMAGES_TOKEN;
  const cloudflare_images_url = `https://api.cloudflare.com/client/v4/accounts/${cloudflare_account_id}/images/v1`;

  const formData = new FormData();

  let urls = [];
  const photoBytes = await photo.bytes();
  formData.append("file", new File([photoBytes], dateString + ".png"));
  const response = await fetch(cloudflare_images_url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cloudflare_images_token}`,
    },
    body: formData,
  });

  const json = await response.json();
  urls.push(JSON.stringify(json));
  return urls;
}
