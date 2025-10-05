export function generateEntryMarkdown(bodyProps, dateString) {
  let { "mp-slug": title } = bodyProps;
  let { content, photo, category, dateIsoString } = bodyProps;
  if (!dateIsoString) {
    const date = new Date();
    dateIsoString = date.toISOString();
  }

  let categoryVar = JSON.stringify(category);
  categoryVar = categoryVar ? `${categoryVar}` : "[]";

  const imageVar = photo ? `"${photo.value}"` : null;
  const altVar = photo ? `"${photo.alt}"` : null;

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
