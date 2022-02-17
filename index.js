const core = require('@actions/core');
const github = require('@actions/github');
const { correctBoards, correctMessage } = require('./utils');


  // Query to get the Relay ID of the Project vNext
  const getProjectNextQuery = (organization, projectNextNumber) => {
    return `{
      organization(login: "${organization}") {
        projectNext(number: ${projectNextNumber}) {
          id
        }
      }
    }`;
  };

  // Query to get the Relay ID of the Issue
  const getIssue = (repoOwner, repoName, issueNumber) => {
    return `{
      repositoryOwner(login: "${repoOwner}") {
        repository(name: "${repoName}") {
          issue(number: ${issueNumber}) {
            id
          }
        }
      }
    }`;
  };

  // Mutation to add the issue to the Project vNext
  const addIssueToProjectNext = (contentId, projectRelayId) => {
    return `mutation {
      addProjectNextItem(input: {contentId: "${contentId}", projectId: "${projectRelayId}"}) {
        projectNextItem {
          id
        }
      }
    }`;
  }


async function run() {
  try {
    const issueNb= github.context.payload.issue.number;
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const label = github.context.payload.label.name;

    const token = core.getInput('token');
    const octokit = github.getOctokit(token);

    const labelBoards = core.getInput('boards').split("\n");
    const match = labelBoards.find((labelBoard) => {
      return labelBoard.split("=")[0] === label;
    });

    const message = core.getInput('message');

    if (match) {
      const boards = correctBoards(match.split("=")[1]);
      const comment = correctMessage(message, boards, label);
      const createCommentResponse = await octokit.issues.createComment({
        owner,
        repo,
        issue_number: issueNb,
        body: comment
      });
      const queryGetID = getIssue(repoOwner = owner, repoName = repo, issueNumber = issueNb);
      console.log("HERE TEST" + JSON.stringify(queryGetID));

      const resIssueId = await octokit.graphql(queryGetID);
      console.log("HERE TEST0" + JSON.stringify(resIssueId));
      const issueId = resIssueId.repositoryOwner.repository.issue.id;
      const result = await octokit.graphql(addIssueToProjectNext(contentId = issueId, projectRelayId = boards ));
      console.log("HERE TEST1" + boards);
      console.log("HERE TEST3" + result);
    } else {
      console.log("No matching recipients found for label ${label}.");
    }
  } catch (error) {
    console.error(error);
    core.setFailed(`The issue-label-notification-action action failed with ${error}`);
  }
}

run();
