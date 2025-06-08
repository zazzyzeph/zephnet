import { githubCommitFromAuthenticatedPost } from "./src/github_commit.js";

const yaml = require("js-yaml");
const fs = require("fs");

// i mentioned in my /about page that i would take the address of the micropub address to my grave.
// funny message 4 the hackers
export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    const doc = yaml.load(fs.readFileSync("../config.yaml", "utf8"));
  } catch (e) {
    console.log(e);
  }
  return new Response(doc);
}

// handle any POST request in this function
export async function onRequestPost(context) {
  // split out the request and env objects from the context object with destructive assignment
  const { request, env } = context;
  const response = githubCommitFromAuthenticatedPost(request, env);
  return response;
}
