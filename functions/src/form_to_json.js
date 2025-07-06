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
  // entries() returns an iterator of kv pairs
  for (const entry of formData.entries()) {
    // why are all values wrapped in array wrappers? i dunno, they just are.
    jsonProperties[entry[0]] = [entry[1]];
  }

  let json = {
    type: ["h-" + h],
    properties: jsonProperties,
  };

  return json;
}
