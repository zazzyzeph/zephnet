export async function githubCommitFromAuthenticatedPost(
  request,
  env,
  postMd,
  dateString,
) {
  // no try/catch, that's handled by the caller
  // GitHub API configuration
  const GH_TOKEN = env.GH_TOKEN;
  const GH_USERNAME = env.GH_USERNAME;
  const REPO = env.REPO;
  const BRANCH = env.BRANCH || "main";

  if (!GH_TOKEN || !GH_USERNAME || !REPO) {
    throw new Error("missing github configuration variables");
  }

  const fileName = dateString + ".md";

  // markdown content for the file
  const fileContent = postMd;

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
  // expectedHeadOid - github expects the SHA value of the current commit (before we push this new one)
  const variables = {
    input: {
      branch: {
        repositoryNameWithOwner: `${GH_USERNAME}/${REPO}`,
        branchName: BRANCH,
      },
      message: {
        headline: `Add ${fileName}`,
      },
      fileChanges: {
        additions: [
          {
            path: "content/posts/" + fileName,
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
      "User-Agent": "zndb/1.0",
    },
    body: JSON.stringify({
      query: mutation,
      variables: variables,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error("error making request to github:", result.errors);
  }

  // we're good!
  return true;
}

// Helper function to get the latest commit SHA for the requested branch
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
      "User-Agent": "zndb/1.0",
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
