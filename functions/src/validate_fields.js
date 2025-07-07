export function validateFields(body) {
  const props = body.properties;

  const postTypes = {
    note: ["content"],
    photo: ["photo", "alt"],
    event: ["name", "start", "end", "location", "summary"],
  };

  let hasRequiredKeys = false;
  for (const type in postTypes) {
    if (
      postTypes[type].every((p) => {
        return p in props && props[p].length > 0;
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
