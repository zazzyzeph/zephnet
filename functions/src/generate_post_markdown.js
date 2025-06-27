export function generatePostMarkdown(
  title = "",
  content = "",
  image = null,
  alt = null,
  tags = [],
) {
  const date = new Date();
  const dateString = date.toISOString();

  const imageVar = image ? `"${image}"` : null;
  const altVar = alt ? `"${alt}"` : null;

  title = title ?? "{{ .File.UniqueID }}";
  let md = ` 
---
title: "${title}"
type: "posts"
date: "${dateString}"
featured_image: ${imageVar}
featured_image_alt: ${altVar}
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
