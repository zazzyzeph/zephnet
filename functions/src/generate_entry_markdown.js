export function generateEntryMarkdown(
  title = "",
  content = "",
  image = null,
  alt = null,
  tags = [],
  dateIsoString = "",
) {
  if (!dateIsoString) {
    const date = new Date();
    const dateIsoString = date.toISOString();
  }

  const imageVar = image ? `"${image}"` : null;
  const altVar = alt ? `"${alt}"` : null;

  title = title ?? "{{ .File.UniqueID }}";
  let md = ` 
---
title: "${title}"
type: "posts"
date: "${dateIsoString}"
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
