export function generateEntryMarkdown(bodyProps) {
  //title = "",
  //content = "",
  //image = null,
  //alt = null,
  //category = [],
  //dateIsoString = "",
  const { "mp-slug": title, "mp-photo-alt": alt } = bodyProps;
  let { content, photo, category, dateIsoString } = bodyProps;
  if (!dateIsoString) {
    const date = new Date();
    dateIsoString = date.toISOString();
  }

  const categoryVar = JSON.stringify(category);

  const imageVar = photo ? `"${photo}"` : null;
  const altVar = alt ? `"${alt}"` : null;

  let md = ` 
---
title: "${title}"
type: "posts"
date: "${dateIsoString}"
featured_image: ${imageVar}
featured_image_alt: ${altVar}
category: ${categoryVar}
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
