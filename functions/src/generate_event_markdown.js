export function generateEventMarkdown(bodyProps) {
  let { category: tags } = bodyProps;
  let { name, start, end, content, location, dateIsoString } = bodyProps;
  let {
    name: locName,
    latitude: locLatitude,
    longitude: locLongitude,
    "street-address": locStreetAddress,
    locality: locLocality,
    region: locRegion,
    "country-name": locCountryName,
  } = location.properties;
  if (!dateIsoString) {
    const date = new Date();
    dateIsoString = date.toISOString();
  }

  const tagsVar = JSON.stringify(tags);

  const startDate = new Date(start);
  start = startDate.toISOString();

  const endDate = new Date(end);
  end = endDate.toISOString();

  let md = ` 
---
title: "${name}"
type: "event"
date: "${dateIsoString}"
category: ${tagsVar}
location:
  name: ${locName}
  latitude: ${locLatitude}
  longitude: ${locLongitude}
  street_address: ${locStreetAddress}
  locality: ${locLocality}
  region: ${locRegion}
  country_name: ${locCountryName}
params:
  start: ${start}
  end: ${end}
---
${content}
`;
  return md.trim();
}
