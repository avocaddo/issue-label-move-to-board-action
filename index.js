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
const updateIssueWithFieldNext = (contentId, projectRelayId, field, value) => {
    return `mutation {
        updateProjectNextItemField(input: {contentId: "${contentId}", projectId: "${projectRelayId}", fieldId: "${field}", value: "${value}"}) {
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
      if (shouldUpdateWithField) {
        const fieldLabel = all[1].replace(/^"|"$/g, '');
        const fieldValue = all[2].replace(/^"|"$/g, '');
        console.log("LOG 0" + JSON.stringify(board) + "\n");
        console.log("LOG 1" + JSON.stringify(fieldLabel) + "\n");
        console.log("LOG 2" + JSON.stringify(fieldValue) + "\n");
      }

      console.log("LOG 3" + message + "\n");

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
      console.log("LOG 3" + JSON.stringify(queryGetID));

      const resIssueId = await octokit.graphql(queryGetID);
      console.log("LOG 4" + JSON.stringify(resIssueId));

      const issueId = resIssueId.repositoryOwner.repository.issue.id;
      const result = await octokit.graphql(addIssueToProjectNext(contentId = issueId, projectRelayId = board ));
      console.log("LOG 5" + JSON.stringify(result));

      const itemId = result.data.addProjectNextItem.projectNextItem.id;
      console.log("LOG 6" + JSON.stringify(itemId));

      if (shouldUpdateWithField){
        const queryUpdateField = updateIssueWithFieldNext(contentId = issueId, projectRelayId = board, field = fieldLabel, value = fieldValue);
        console.log("LOG 7" + JSON.stringify(queryUpdateField));
        const resultUpdate = await octokit.graphql(queryUpdateField);
        console.log("LOG 8" + JSON.stringify(resultUpdate));
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
