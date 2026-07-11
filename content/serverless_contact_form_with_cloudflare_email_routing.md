---
title: "Serverless_contact_form_with_cloudflare_email_routing"
type: "posts"
date: 2026-07-05T18:04:20-04:00
featured_image: null
featured_image_alt: null
tags: ["cloudflare", "email", "free"]
---

## The problem

Contact forms are common features of websites, which let users contact the the website owner, without exposing the website owner's email address. They frequently include fields like 'Name', 'Email Address', and 'Message'.They'll also usually include some  spam prevention measures like a [ReCaptcha](https://developers.google.com/recaptcha/) or [Turnstile](https://www.cloudflare.com/products/turnstile/), and possibly a hidden 'honeypot' field (more on those later!)

I host on Cloudflare Pages, which does not have a ready-made solution for a 'contact' form. Other 'serverless' hosting providers have some nifty solutions for this ([Netlify](https://docs.netlify.com/manage/forms/setup/), [pico.sh](https://blog.pico.sh/ann-035-pgs-features)).

Anywho, I had to rig up my own! I was able to do it for the cost of a single throwaway domain name through a Cloudflare service called [Email Routing](https://www.cloudflare.com/products/email-routing/). It ended up costing me $0.85 a year, and some of the hair I lost figuring out how it all works with Cloudflare Workers. Not bad!

- I don't expect much traffic
- I do want some decent spam prevention
- If possible, I want the service to:
    - Email an address on submission with a `name`, `email` (address), and `message` from the contact form on my website.
    - Be cheap as possible :^)

 There are ready-made contact form services like [FormSpree](https://formspree.io/) which are pretty popular. The problem is, I want to limit my contactee's privacy exposure.

## Getting
