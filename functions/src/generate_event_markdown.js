export function generateEventMarkdown(
  name = "",
  start = "",
  end = "",
  location = "",
  summary = "",
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
title: "${name}"
type: "events"
date: "${dateIsoString}"
tags: []
params:
  start: ${start},
  end: ${end},
  location: ${location},
---
${summary}
`;
  return md;
}
