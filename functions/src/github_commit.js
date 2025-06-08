export async function githubCommitFromAuthenticatedPost(request, env) {
  try {
    // Parse multipart/form-data
    const formData = await request.formData();
    // GitHub API configuration
    const GH_TOKEN = env.GH_TOKEN;
    const GH_USERNAME = env.GH_USERNAME;
    const REPO = env.REPO;
    const BRANCH = env.BRANCH || "main";

    if (!GH_TOKEN || !GH_USERNAME || !REPO) {
      return new Response("missing github configuration variables", {
        status: 500,
      });
    }

    // content for test.md file
    const fileContent = `created via micropub on ${new Date().toISOString()}.`;

    // github needs the new file's content to be a base64 blob
    const encodedContent = btoa(unescape(encodeURIComponent(fileContent)));

    // graphql mutation for CreateCommitOnBranch
    // sent as part of the gh request body
    // https://docs.github.com/en/graphql/reference/mutations#createcommitonbranch
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

    // variables object for the gh request body
    const variables = {
      input: {
        branch: {
          repositoryNameWithOwner: `${GH_USERNAME}/${REPO}`,
          branchName: BRANCH,
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
        expectedHeadOid: await getLatestCommitSha(
          GH_TOKEN,
          GH_USERNAME,
          REPO,
          BRANCH,
        ),
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

// Helper function to get the latest commit SHA for a specific branch
async function getLatestCommitSha(token, owner, repo, branchName) {
  const query = `
    query GetLatestCommit($owner: String!, $repo: String!, $branchName: String!) {
      repository(owner: $owner, name: $repo) {
        ref(qualifiedName: $branchName) {
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
      variables: { owner, repo, branchName: `refs/heads/${branchName}` },
    }),
  });

  const result = await response.json();

  if (result.errors || !result.data.repository.ref) {
    throw new Error(
      `Failed to get commit SHA for branch ${branchName}: ${JSON.stringify(result.errors || "Branch not found")}`,
    );
  }

  return result.data.repository.ref.target.oid;
}
