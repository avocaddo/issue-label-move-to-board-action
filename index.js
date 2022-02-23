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

  // Add the issue to the Project vNext
  const addIssueToProjectNext = (contentId, projectRelayId) => {
    return `mutation {
      addProjectNextItem(input: {contentId: "${contentId}", projectId: "${projectRelayId}"}) {
        projectNextItem {
          id
        }
      }
    }`;
  }

  // Update the issue to the Project vNext
const updateIssueWithFieldNext = (projectRelayId, field, value, id) => {
    return `mutation {
        updateProjectNextItemField(input: { projectId: "${projectRelayId}", itemId: "${id}", fieldId: "${field}", value: "${value}"}) {
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

    const labelBoardFields = core.getInput('boards').split("\n");
    const match = labelBoardFields.find((labelBoardField) => {
      return labelBoardField.split("=")[0] === label;
    });

    const message = core.getInput('message');
    if (match) {
      const boardField = correctBoards(match.split("=")[1]);
      const all = boardField.split(",");
      const board = all[0];
      const shouldUpdateWithField = all && all.length > 2;

      if(message && message.length > 0) {
        const comment = correctMessage(message, board, label);
        const _ = await octokit.issues.createComment({
          owner,
          repo,
          issue_number: issueNb,
          body: comment
        });
      }

      const queryGetID = getIssue(repoOwner = owner, repoName = repo, issueNumber = issueNb);

      const resIssueId = await octokit.graphql(queryGetID);

      const issueId = resIssueId.repositoryOwner.repository.issue.id;
      const result = await octokit.graphql(addIssueToProjectNext(contentId = issueId, projectRelayId = board ));

      const itemId = result.addProjectNextItem.projectNextItem.id;

      if (shouldUpdateWithField){
        const fieldLabel = all[1].replace(/^"|"$/g, '');
        const fieldValue = all[2].replace(/^"|"$/g, '');
        const queryUpdateField = updateIssueWithFieldNext(projectRelayId = board, field = fieldLabel, value = fieldValue, id = itemId);
        const resultUpdate = await octokit.graphql(queryUpdateField);
      }
    } else {
      console.log("No matching recipients found for label ${label}.");
    }
  } catch (error) {
    console.error(error);
    core.setFailed(`The issue-label-move-to-board-action action failed with ${error}`);
  }
}

run();
