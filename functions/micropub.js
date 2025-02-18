export function onRequestGet(context) {
  return new Response("Hey kid! Scram! (POST requests only)")
}

export function onRequestPost(context) {
  if (context.env.DEV){
    let template = `
---
title: "First"
type: "posts"
date: 2024-12-28T14:50:07-05:00
draft: false
featured_image: false
featured_image_alt: false
---

content content content
    `
    return new Response(JSON.stringify(context.request.body)
  }
  return new Response("request denied")
}

