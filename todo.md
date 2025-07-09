# To-dos

## Micropub
- [x] get the cloudflare worker to make a commit via the github graphql api
    - https://docs.github.com/en/graphql/reference/mutations#createcommitonbranch
- [ ] handle an image via the media endpoint
    - https://developers.cloudflare.com/images/upload-images/upload-file-worker/
    - worked with taking media straight from the formData (no media endpoint), need to check if quill will get the files to the media endpoint first and use the filenames in the posts
- [x] make a post from [Quill](https://quill.p3k.io/)
- [ ] make an event post from quill

## Editing
- [x] create posts table
    - `CREATE TABLE posts (posts_id INTEGER PRIMARY_KEY, filename TEXT NOT NULL UNIQUE, post_type TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, image_url TEXT NOT NULL, alt_text TEXT NOT NULL, tags TEXT NOT NULL, start_timestamp TEXT NOT NULL, end_timestamp TEXT NOT NULL, location TEXT NOT NULL)`
- [ ] store all applicable fields when making a post or event
- [ ] write an endpoint to 

## Webmentions
- [ ] integrate webmention.io
    - https://rknight.me/blog/adding-webmentions-to-your-site/
    - research - webmention.io can send webhooks to a site when a comment|like happens. we could ingest that hook and rebuild the site.
        - how would i rate limit tho :thinking_face:

## POSSE
- [ ] integrate bridgy(fed?)
    - https://fed.brid.gy/
