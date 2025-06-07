export async function onRequestGet(context) {
  const { request, env } = context;
  return new Response("Who gave you this address");
}

export async function onRequestPost(context) {
  // split out the request and env objects from the context object with destructive assignment
  const { request, env } = context;

  try {
    // Parse multipart/form-data
    const formData = await request.formData();

    // GitHub API configuration
    const GH_TOKEN = env.GH_TOKEN;
    const GH_USERNAME = env.GH_USERNAME;
    const REPO = env.REPO;
    const BRANCH = env.BRANCH;

    if (!GH_TOKEN || !GH_USERNAME || !REPO) {
      return new Response("Missing GitHub configuration", { status: 500 });
    }

    // Content for test.md file
    const fileContent = `# Test File

This file was created via micropub on ${new Date().toISOString()}.

## Form Data Received:
${Array.from(formData.entries())
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}
`;

    // Encode content to base64
    const encodedContent = btoa(unescape(encodeURIComponent(fileContent)));

    // GraphQL mutation to create/update file
    const mutation = `
      mutation CreateFile($input: CreateCommitOnBranchInput!) {
        createCommitOnBranch(input: $input) {
          commit {
            oid
            url
          }
        }
      }
    `;

    const variables = {
      input: {
        branch: {
          repositoryNameWithOwner: `${GH_USERNAME}/${REPO}`,
          branchName: `${BRANCH}`,
        },
        message: {
          headline: "Add test.md",
        },
        fileChanges: {
          additions: [
            {
              path: "test.md",
              contents: encodedContent,
            },
          ],
        },
        expectedHeadOid: await getLatestCommitSha(GH_TOKEN, GH_USERNAME, REPO),
      },
    };

    // make request to github
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "Micropub/1.0",
      },
      body: JSON.stringify({
        query: mutation,
        variables: variables,
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error("error making request to github:", result.errors);
      return new Response(
        `GitHub API error: ${JSON.stringify(result.errors)}`,
        { status: 500 },
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        commit: result.data.createCommitOnBranch.commit,
        message: "File test.md created successfully",
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error in onRequestPost:", error);
    return new Response(`Server error: ${error.message}`, { status: 500 });
  }
}

// Helper function to get the latest commit SHA
async function getLatestCommitSha(token, owner, repo) {
  const query = `
    query GetLatestCommit($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        defaultBranchRef {
          target {
            oid
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "Micropub-Handler/1.0",
    },
    body: JSON.stringify({
      query: query,
      variables: { owner, repo },
    }),
  });

  const result = await response.json();
  return result.data.repository.defaultBranchRef.target.oid;
}
