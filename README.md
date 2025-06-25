# zephnet
My personal Hugo site

A [Hugo](https://gohugo.io) static site with a serverless [Micropub](https://micropub.spec.indieweb.org/) endpoint for adding or managing blog posts.

The site is hosted via [Cloudflare Pages](https://pages.cloudflare.com/) and [Cloudflare Images](https://developers.cloudflare.com/images/) (todo), so some functionality is tied to the specifics of their environment - but this repo should be relatively easy to adapt to any serverless environment.

Micropub endpoint at https://zephnet.biz/micropub

Cloudflare Pages deploys the site when the GitHub repository receives a `push` to the specified branch.

## Local setup

You'll need to install Hugo globally. See [their website for instructions](https://gohugo.io/installation/).

Clone the repo and enter the directory
```
git clone https://github.com/zazzyzeph/zephnet && cd zephnet
```
Copy the example environment variables file into your real env file. You'll update this one with your secrets (it's .gitignore'd)
```
cp .env.dev.example .env.dev
```
When the site is run locally (via `wrangler`) these environment variables will be used by `functions/micropub.js`

**If you want to test the site's micropub post handling locally, update this file**

Install wrangler
```
npm install
```

To run the site
```
npx wrangler pages dev --local-protocol=https ./public
```
## Roadmap

- [x] bespoke hugo theme
- [x] make a commit on github from a POST request
- [x] verify an indieauth token from an authenticated client 
- [x] create a post from an micropub client
- [ ] image handling with cloudflare images
- [ ] micropub an event (to test endpoint handling and generated markup)
- [ ] webmention support for events
- [ ] bridgyfed
