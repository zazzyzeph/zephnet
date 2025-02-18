export function onRequestGet(context) {
  return new Response("Hey kid! Scram! (POST requests only)")
}

export function onRequestPost(context) {
  if (context.env.DEV){
    return new Response(JSON.stringify(context))
  }
  return new Response("request denied")
}

