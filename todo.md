# To-dos

## Micropub
- [ ] get the cloudflare worker to make a commit via the github graphql api
    - https://docs.github.com/en/graphql/reference/mutations#createcommitonbranch
- [ ] handle an image via the media endpoint
    - https://developers.cloudflare.com/images/upload-images/upload-file-worker/

## Webmentions
- [ ] integrate webmention.io
    - https://rknight.me/blog/adding-webmentions-to-your-site/
    - research - webmention.io can send webhooks to a site when a comment|like happens. we could ingest that hook and rebuild the site.
        - how would i rate limit tho :thinking_face:

## POSSE
- [ ] integrate bridgy(fed?)
    - https://fed.brid.gy/
