export function generateEntryMarkdown(bodyProps, dateString) {
  let { "mp-slug": title, "mp-photo-alt": alt } = bodyProps;
  let { content, photo, category, dateIsoString } = bodyProps;
  if (!dateIsoString) {
    const date = new Date();
    dateIsoString = date.toISOString();
  }

  let categoryVar = JSON.stringify(category);
  categoryVar = categoryVar ? `"${categoryVar}"` : "[]";

  const imageVar = photo ? `"${photo}"` : null;
  const altVar = alt ? `"${alt}"` : null;

  if (title == undefined) {
    title = dateString;
  }

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
