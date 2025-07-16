export async function storeToDb(env, props, type, dateString) {
  //const response = await env.db.prepare("SELECT rowid from posts;").run();
  //return response.results;
  const filename = dateString + ".md";

  let preppedProps = {};

  for (const prop in props) {
    if (prop == "category") {
      preppedProps[prop] = JSON.stringify(props[prop]);
    } else if (Array.isArray(props[prop])) {
      if (props[prop].length == 1) {
        preppedProps[prop] = props[prop][0];
      }
      if (props[prop].length > 1) {
        preppedProps[prop] = JSON.stringify(props[prop]);
      }
    } else {
      preppedProps[prop] = props[prop];
    }
  }

  preppedProps.h = type.toString().split("h-")[1];

  let {
    h = "",
    title = "",
    content = "",
    image_url = "",
    alt_text = "",
    category = "",
    start_timestamp = "",
    end_timestamp = "",
    location = "",
  } = preppedProps;

  if (title == "") {
    let untitledNum = 1;
    const dbResponse = await env.db
      .prepare("SELECT rowid from posts order by rowid desc limit 1;")
      .run();
    if (dbResponse.results && dbResponse.results.length != 0) {
      untitledNum = dbResponse.results[0]["rowid"] + 1;
    }
    title = "Untitled " + untitledNum;
  }

  // json stringify will make our tags array a string
  category = JSON.stringify(category);

  const doot = await env.db
    .prepare(
      `insert into posts (filename, h, title, content, image_url, alt_text, category, start_timestamp, end_timestamp, location) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      filename,
      h,
      title,
      content,
      image_url,
      alt_text,
      category,
      start_timestamp,
      end_timestamp,
      location,
    )
    .run();
}
