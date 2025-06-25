export function generatePostMarkdown(
  content = "",
  title = "",
  image = false,
  alt = false,
  tags = [],
) {
  const date = new Date();
  const dateString = date.toISOString();

  title = title ?? "{{ .File.UniqueID }}";
  let md = ` 
---
title: "${title}"
type: "posts"
date: "${dateString}"
featured_image: null
featured_image_alt: null
tags: []
params:
    likes:
        total: 0
        bluesky: 0
        mastodon: 0
    comments:
        total: 0
        bluesky: 0
        mastodon: 0
---
${content}
`;
  return md;
}
