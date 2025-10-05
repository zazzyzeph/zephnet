export function generateEntryMarkdown(bodyProps, dateString) {
  let { "mp-slug": title, "mp-photo-alt": alt } = bodyProps;
  let { content, photo, category, dateIsoString } = bodyProps;
  if (!dateIsoString) {
    const date = new Date();
    dateIsoString = date.toISOString();
  }

  let categoryVar = JSON.stringify(category);
  categoryVar = categoryVar ? `${categoryVar}` : "[]";

  let imageVar = photo ? `"${photo}"` : null;
  let altVar = alt ? `"${alt}"` : null;

  if (imageVar) {
    imageVar = 'https://media.zephnet.biz/' + photo.name
  }

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
tags: ${categoryVar}
---
${content}
`;
  return md.trim();
}
