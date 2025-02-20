export function onRequestGet(context) {
  return new Response("Hey kid! Scram! (POST requests only)")
}

export async function onRequestPost(context) {
  try {
    let input = await context.request.formData()
    let form = Object.fromEntries(input)

    let jsonString = JSON.stringify(form)
    if (form.access_token) {
      if (Object.keys(form).includes('h-entry') && form.content){
        if (context.env.DEV) {
          jsonString = JSON.stringify({'hiiii':'lol'})
        }
        else {
          let url = "https://tokens.indieauth.com/token"
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Accept": "application/json",
              "Authorization": "Bearer " + form.access_token
            }
          })
          if (!response.ok) {
            throw new Error(`Status: ${response.status}`)
          }
          let json = response.json()
          jsonString = JSON.stringify(json)
        }
      }
    }
    return new Response(jsonString, {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    })
  } catch (err) {
    return new Response("Error parsing JSON content", { status: 400 })
  }
}
