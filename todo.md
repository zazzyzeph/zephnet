# To-dos

## Micropub
- [x] get the cloudflare worker to make a commit via the github graphql api
    - https://docs.github.com/en/graphql/reference/mutations#createcommitonbranch
- [x] handle an image via the media endpoint
    - https://developers.cloudflare.com/images/upload-images/upload-file-worker/
    - worked with taking media straight from the formData (no media endpoint), need to check if quill will get the files to the media endpoint first and use the filenames in the posts
- [x] make a post from [Quill](https://quill.p3k.io/)
- [ ] micropub rocks tests
    - [ ] photo post with a url reference for the photo
    - [ ] post with html content
    - [ ] 803: Rejects unauthenticated requests (post isn't created, but response still not to spec)
    - [ ] 804: Rejects unauthorized access tokens (post isn't created, but response still not to spec)
    - [ ] 805: Rejects multiple authentication methods (apparently this is not allowed per spec)
- [ ] make an event post from quill
    - [ ] events should be listed in EST

## Editing
- [x] create posts table
    - `CREATE TABLE posts (posts_id INTEGER PRIMARY_KEY, filename TEXT NOT NULL UNIQUE, post_type TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, image_url TEXT NOT NULL, alt_text TEXT NOT NULL, tags TEXT NOT NULL, start_timestamp TEXT NOT NULL, end_timestamp TEXT NOT NULL, location TEXT NOT NULL)`
- [ ] store all applicable fields when making a post or event
- [ ] write an endpoint to 

## Webmentions
- [x] set up webmention.io
    - https://rknight.me/blog/adding-webmentions-to-your-site/
- [ ] add rsvp support
- [ ] add repost support
- [ ] pull webmentions from webmention.io via offline script, integrate into site build for non js users


## POSSE
- [x] integrate bridgy(fed?)
    - https://fed.brid.gy/

## Now page
- [ ] add post type and integrate into feed
- [ ] add a singles page for just the archive
