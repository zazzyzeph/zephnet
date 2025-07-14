export async function storeToDb(env, props) {
  const response = await env.db.prepare("SELECT * from posts;").run();
  let {
    filename,
    title,
    content,
    image_url,
    alt_text,
    tags,
    start_timestamp,
    end_timestamp,
    location,
  } = props;

  return response;
  // json stringify will make our tags array a string
  tags = JSON.stringify(tags);

  const doot = await env.db
    .prepare(
      `insert into posts (filename, title, content, image_url, alt_text, tags, start_timestamp, end_timestamp, location) values ("${filename}", "${title}", "${content}", "${image_url}", "${alt_text}", "${tags}", "${start_timestamp}", "${end_timestamp}", "${location}")`,
    )
    .run();

  const postTypes = {
    note: ["content"],
    photo: ["photo", "alt"],
    event: ["name", "start", "end", "location", "summary"],
  };

  let hasRequiredKeys = false;
  for (const type in postTypes) {
    if (
      postTypes[type].every((p) => {
        return props[p] && props[p].length > 0 && props[p][0].length;
      })
    ) {
      hasRequiredKeys = true;
    }
    if (type == "event") {
      const start = new Date(props["start"]).getTime();
      const end = new Date(props["end"]).getTime();
      if (end > start) {
        throw new Error("event end can't be before it starts");
      }
    }
  }
  if (hasRequiredKeys) {
    return true;
  }
  throw new Error("required keys not found");
}
