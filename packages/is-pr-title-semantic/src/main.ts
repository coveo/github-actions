import { context, getOctokit } from "@actions/github";
import dedent from "dedent";
import { spawn } from "child_process";
import type { PullRequestEvent } from "@octokit/webhooks-definitions/schema";

const octokit = getOctokit(process.env.GITHUB_TOKEN ?? "");
const BotCommentTag = `<!-- @coveo/is-pr-title-semantic -->`;

async function findInitialCommentId(): Promise<number | null> {
  const comments = await octokit.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: (context.payload as PullRequestEvent).pull_request.number,
  });
  const comment = comments.data.find((comment) =>
    comment.body?.includes(BotCommentTag)
  );
  return comment?.id ?? null;
}

function runCommitLint() {
  return new Promise<string | null>((resolve) => {
    const commitlintProcess = spawn("npx", ["commitlint"]);
    commitlintProcess.stdin.write(
      (context.payload as PullRequestEvent).pull_request.title
    );
    commitlintProcess.stdin.end();
    let output = "";
    commitlintProcess.stderr.on("data", (data) => {
      output += data.toString();
    });
    commitlintProcess.stdout.on("data", (data) => {
      output += data.toString();
    });
    commitlintProcess.on("close", () => {
      resolve(output);
    });
  });
}

async function run(): Promise<void> {
  const currentCommentId = await findInitialCommentId();
  const commitLintResult = await runCommitLint();
  if (currentCommentId) {
    octokit.rest.issues.deleteComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: currentCommentId,
    });
  }
  if (commitLintResult) {
    await octokit.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: (context.payload as PullRequestEvent).pull_request.number,
      body: dedent`
      ${BotCommentTag}
      Pull Request Title is not semantic:
      ${commitLintResult.replace(/^/gm, "> ")}
    `,
    });
    process.exit(1);
  }
}

run();
