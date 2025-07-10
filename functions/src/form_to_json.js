export function formToJson(formData, token) {
  // the json structure of a micropub creation request is pretty similar to the form-encoded/multipart request
  // the main differences are:
  // "h" => "entry" becomes 'type': 'h-entry'
  // the token can come in the form body as 'access_token' (as opposed to the Authorization header)
  // all of the other key/value pairs end up in the 'properties' object
  // we should ingest and then delete the access_token kv pair before we feed the formData to this function
  // then store the 'h' => 'entry' value for 'type' later
  // then delete 'h' from the formData so we can feed all the rest to the 'properties' object

  const h = formData.get("h");
  if (h) {
    formData.delete("h");
  }

  let jsonProperties = {};
  let formDataKeys = [];
  for (let entry of formData.entries()) {
    // why are all property values for json micropub requests wrapped in array wrappers? i dunno, they just are.
    // anyway, ditch the [] from the formData keys
    if (typeof entry[0] == "string") {
      entry[0] = entry[0].split("[]")[0];
    }
    if (formDataKeys.includes(entry[0])) {
      jsonProperties[entry[0]].push(entry[1]);
    } else {
      jsonProperties[entry[0]] = [entry[1]];
      formDataKeys.push(entry[0]);
    }
  }

  let json = {
    type: ["h-" + h],
    properties: jsonProperties,
  };

  return json;
}
