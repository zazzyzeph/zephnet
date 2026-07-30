---
title: "Serverless Contact Form with Cloudflare Workers and Email Routing"
type: "entry"
date: 2026-07-30T18:04:20-04:00
featured_image: https://media.zephnet.biz/contact_article.jpg
featured_image_alt: "a screenshot of my contact form, with example submission text - from Jeff Pokeman, email address youngster@hotmail.com, message I like shorts! They're comfy and easy to wear! It has a cloudflare turnstile spam prevention widget, and a submit button."
tags: ["cloudflare", "email", "free"]
---

This article goes over the contact form on my [Cloudflare Pages](https://pages.cloudflare.com/) static site using [Cloudflare Workers](https://www.cloudflare.com/products/workers/) and [Cloudflare Email Routing](https://www.cloudflare.com/products/email-routing/). You get all this for the cost of one non-user-facing domain name - you can currently get a ~$0.85/yr `<random-string-of-numbers>.xyz` from most domain registrars (thanks to [Graham Vasquez](https://gvasquez.dev) for the tip!!) 

You can see the example-ified Cloudflare worker at https://github.com/zazzyzeph/contact_form_cloudflare_worker_example, but for further details - read on!

Contact forms are common features of websites, which let users contact the the website owner without exposing the website owner's email address. They frequently include fields like 'Name', 'Email Address', and 'Message'. They'll also usually include some  spam prevention measures like a [ReCaptcha](https://developers.google.com/recaptcha/) or [Turnstile](https://www.cloudflare.com/products/turnstile/), and possibly a hidden 'honeypot' field (more on those later!)

I host on Cloudflare Pages, which doesn't have a ready-made solution for a 'contact' form. Other '[serverless](https://en.wikipedia.org/wiki/Serverless_computing)' hosting providers like [Netlify](https://docs.netlify.com/manage/forms/setup/) and [pico.sh](https://blog.pico.sh/ann-035-pgs-features) have some nifty ready-made solutions for this.

Anywho, I rolled my own! 

There are also ready-made contact form services like [FormSpree](https://formspree.io/) which are pretty popular. The problem is, I want to limit my contactee's privacy exposure, and I am cheap :)

## The Build Out

### Contact Form Frontend

A `<form>` containing fields for: 
 
- Name
- Email
- A `<textarea>` for `message` 
- Cloudflare's [Turnstile widget](https://www.cloudflare.com/products/turnstile/)
- A `<button>` to submit the form

Bonus - add an `<input type="text" name="mood" />` and hide it (via CSS' `display:none`) (Some less sophisticated bots will fill out every field in a `<form>`. We can disregard form submissions in the Worker endpoint that have text entered in `mood`)

#### Contact form JavaScript

``` JS
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.querySelector('#contactForm');
  const successMessage = document.querySelector('#successMessage')
  const errorMessage = document.querySelector('#errorMessage')
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const res = await fetch("https://contact.zephnet.biz", {
      method: "POST",
      body: new FormData(e.target),
    });
    if (res.ok) {
      contactForm.classList.add('hidden');
      successMessage.classList.remove('hidden');
    } else {
      errorMessage.classList.remove('hidden');
    }
  });
});

```

#### Contact Form CSS

``` CSS
#contactForm input, #contactForm label, #contactForm textarea {
  display: block;
  width: 100%;
  max-width: 400px;
  border-radius: 4px; 
  font-size: 18px;
  border: 0 none;
}

#contactForm label {
  font-weight: bold;
}

#contactForm input, #contactForm textarea {
  border: 2px solid #d5c4a1;
  margin: 5px 0 15px;
  padding: 5px;
}

#contactForm textarea {
  height: 16ch;
}

#contactForm button.button {
  display: block;
  margin: 15px 0 30px;
}

#contactForm label.mood {
  /* honeypot field */
  display: none;
}

.formMessage span {
  padding: 20px;
  font-size: 18px;
  display: inline-block;
  border-size: 1px;
  border-style: solid;
  border-radius: 4px;
}


#successMessage {
  border-color: #427b58;
  color: #427b58;
}


#errorMessage {
  border-color: #9d0006;
  color: #9d0006;
}

```

Ideally I'd like to have this form work _without_ JavaScript, but I couldn't get Turnstile to work without it :/

### The Worker

The Worker has a few features:
- Accept `multipart/form-data` or `application/x-www-form-urlencoded` POST requests with the expected fields
    - Validate the submitted Turnstile field with Cloudflare
    - Validate the fields
        - Make sure required fields are there (name, email, message, turnstile)
        - Email validation via a simple RegEx
    - Reject submissions with content in the honeypot field
    - Reject submissions that aren't from the allowed origin URL
- Generate a MIME email via the npm `mimetext` library
- Send the email to Cloudflare Email Routing via `cloudflare:email`

All of this is done in a single file, which you can find at https://github.com/zazzyzeph/contact_form_cloudflare_worker_example/blob/master/src/index.js

### Conclusion

That about covers it! I made a boilerplate of my Cloudflare Worker at https://github.com/zazzyzeph/contact_form_cloudflare_worker_example/tree/master

If you have any questions, get in touch via my [contact form](https://zephnet.biz/contact/) :)
