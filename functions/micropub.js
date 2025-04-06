async function createPost(env, content, postTitle) {
  // pass in env from context.env
  const token = env.TOKEN;
  const username = env.USERNAME;
  const repo = env.REPO;
  const branch = env.BRANCH;
  const postsRepoDir = env.POSTS_REPO_DIR;
  const postsPublicDir = env.POSTS_PUBLIC_DIR;

  const endpoint = "https://api.github.com/graphql";

  const query = `
        mutation ($input: CreateCommitOnBranchInput!) {
            createCommitOnBranch(input: $input) {
                commit {
                    oid
                    url
                }
            }
        }
    `;

  // the file content needs to be a base64 blob for the gh api
  const base64PostContent = btoa(content);

  const vars = {
    input: {
      branch: {
        repositoryNameWithOwner: `${username}/${repo}`,
        branchName: branch,
      },
      message: {
        headline: `new post - ${postTitle}`,
      },
      fileChanges: {
        additions: [
          {
            path: `${postsRepoDir}/${postTitle}.md`,
            contents: base64PostContent,
          },
        ],
      },
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, vars }),
  });

  const result = await response.json();

  if (result.errors) {
    return new Response(JSON.stringify({ error: result.errors }), {
      status: 400,
    });
  } else {
    return new Response(
      JSON.stringify({
        message: `https://${baseUrl}/$`,
        url: result.data.createCommitOnBranch.commit.url,
      }),
      { status: 200 },
    );
  }
}

export function onRequestGet(context) {
  // default response if the user didn't include any micropub-spec arguments
  return new Response("Who gave you this address");
}

export async function onRequestPost(context) {
  try {
    let input = await context.request.formData();
    let form = Object.fromEntries(input);
    let formKeys = Object.keys(form);
    let jsonString = JSON.stringify(form);
    if (form.access_token) {
      // our DEV environment variable lets us bypass autorization
      if (!context.env.DEV) {
        let url = "https://tokens.indieauth.com/token";
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + form.access_token,
          },
        });
        if (!response.ok) {
          jsonString = "{Status: response.status}";
          return new Response(jsonString, {
            headers: {
              "Content-Type": "application/json;charset=utf-8",
            },
          });
        }
        let json = response.json();
        jsonString = JSON.stringify(json);
      }
    }
    // by this point we should be authorized
    // if the 'h' key is present, we're trying to create a post
    if (formKeys.includes("h") && formKeys.includes("content")) {
      jsonString = `{ content: 'we did it joe' }`;
    }
    return new Response(jsonString, {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    });
  } catch (err) {
    return new Response("Error parsing JSON content", { status: 400 });
  }
}
