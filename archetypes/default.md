---
title: "{{ replace .Name "-" " " | title }}"
type: "posts"
date: {{ .Date }}
featured_image: false
featured_image_alt: false
params:
    likes:
        total = 0
        bluesky = 0
        mastodon = 0
    comments:
        total = 0
        bluesky = 0
        mastodon = 0
---

