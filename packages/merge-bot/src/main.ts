import { context, getOctokit } from "@actions/github";
import dedent from "dedent";
import type {
  IssueCommentEditedEvent,
  PullRequestOpenedEvent,
} from "@octokit/webhooks-definitions/schema";

const octokit = getOctokit(process.env.GITHUB_TOKEN ?? "");

// most @actions toolkit packages have async methods
function isNewPr(): boolean {
  return context.eventName === "pull_request";
}

function isMergeRequested(): boolean {
  if (
    context.eventName !== "issue_comment" ||
    context.payload.action !== "edited" ||
    context.payload.comment?.user.login !== "github-actions[bot]"
  ) {
    return false;
  }

  const after = (context.payload as IssueCommentEditedEvent).comment.body.split(
    "[x]"
  );
  const before = (
    context.payload as IssueCommentEditedEvent
  ).changes.body?.from.split("[ ]");
  if (after.length !== 2 || before?.length !== 2) {
    return false;
  }

  for (let index = 0; index < before.length; index++) {
    if (before[index] !== after[index]) {
      return false;
    }
  }

  return true;
}

async function createInitialComment(): Promise<void> {
  await octokit.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: (context.payload as PullRequestOpenedEvent).pull_request
      .number,
    body: dedent`
      Thanks for your contribution @${
        (context.payload as PullRequestOpenedEvent).sender.login
      } !
      When your pull-request is ready to be merged, check the box below to merge it

      - [ ] Merge! :shipit:
    `,
  });
}

async function attemptMerge(): Promise<void> {
  const prMetaDataIdentifier = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.issue.number,
  };

  await octokit.rest.issues.deleteComment({
    owner: prMetaDataIdentifier.owner,
    repo: prMetaDataIdentifier.repo,
    comment_id: (context.payload as IssueCommentEditedEvent).comment.id,
  });

  try {
    await octokit.rest.pulls.merge({
      ...prMetaDataIdentifier,
      commit_title: `${
        (context.payload as IssueCommentEditedEvent).issue.title
      } (#${(context.payload as IssueCommentEditedEvent).issue.number})`,
      merge_method: "squash",
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
    await octokit.rest.issues.createComment({
      owner: prMetaDataIdentifier.owner,
      repo: prMetaDataIdentifier.repo,
      issue_number: prMetaDataIdentifier.pull_number,
      body: dedent`
        Sorry @${
          (context.payload as IssueCommentEditedEvent).sender.login
        }, this PR does not satisifies all conditions of mergeability:

        - ${error.message.replace(/(?<=\.)\s(?=[\w])/g, "\n- ")}

        Modify your pull request to satisfies them and check the box below to try again:
        - [ ] Merge! :shipit:

        You can also reach out to a maintainer if you think your contribution should be merged regardless of the reported issues.
      `,
    });
  }
}

async function run(): Promise<void> {
  if (isNewPr()) {
    await createInitialComment();
    return;
  }
  if (isMergeRequested()) {
    await attemptMerge();
    return;
  }
}

run();
