# GitHub Action - Issue Label Move to Board
This GitHub Action allows you to add an issue to specific boards (with a given value to a metadata field) when specific labels are added to the issue.

It runs every time a label is attached to an issue, and compares the label to the associated list of boards you specified. If a match is found, the action will add the issue to the given board.

## Usage
### Pre-requisites
Create a workflow `.yml` file in your repositories `.github/workflows` directory. An [example workflow](#example-workflow) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs
- `boards`: A map of labels and which board (Board ID) to add the issue to. Multiple labels can be configured by putting each on a newline. Multiple boards can be configured for each label by putting a space between them.
- `message`: (Optional) The message to include in the comment. Must include at least `{receipients}` but can also include `{label}`. See the default message in the action.yml file.

### Getting the correct board ID
To get the board ID, go to your board in the GitHub UI and locate the URL:
For example:
```
https://github.com/users/avocaddo/projects/1
```

Here Login will be users or org, here `avocaddo` and the project number is the last number in the URL `1`.

Use the github CLI to get the actual board ID:

For organizations:
```
gh api graphql -f query='
  query{
    organization(login: "your_org"){
      projectNext(number: your_number) {
        id
      }
    }
  }'
```

For users:

```
gh api graphql -f query='
  query{
    user(login: "your_user"){
      projectNext(number: your_number) {
        id
      }
    }
  }'
```

Example from above:
```
gh api graphql -f query='
  query{
    user(login: "avocaddo"){
      projectNext(number: 1) {
        id
      }
    }
  }'

>
{
  "data": {
    "user": {
      "projectNext": {
        "id": "PN_kwHOAmFUEs4AAzzzzz"
      }
    }
  }
}
```
Here your board ID is PN_kwHOAmFUEs4AAzzzzz
### Example workflow

```yaml
name: Add issue to boards based on issue labels

on:
  issues:
      types: [labeled]

jobs:
  add-to-board:
    runs-on: ubuntu-latest
    steps:
        - uses: avocaddo/issue-label-move-to-board-action@1.0
          with:
             boards: |
                  #board={boardID}
                  manhattan=PN_kwHOAmFUEs4AAzKJ
                  brooklyn=PN_kwHOAmFUEs4AAzKZ
```
### Associating project vNext metadata to your issue

For some more advanced scenario, not only you want to respond to a label and add the issue to the correct board but you may want to associate some metadata to this issue so it will end up directly to the right view.

First you need to find the field ID and the associated value ID of the metadata you want to insert:
```
  gh api graphql -f query='
    query{
        organization(login: "avocaddo"){
        projectNext(number: 1) {
            id, fields(first:20) {nodes {id, name, settings}}
            }
        }
    }'
 ```
 
Locate your field ID and the ID of the option you want to associate to the issue
 ```
 {
  "id": "MDE2OlByb2plY3ROZXh0RmllbGQxNzY0OTcy",
  "name": "My field",
  "settings": "{\"options\":[{\"id\":\"0971734d\",\"name\":\"First option\"
  ,\"name_html\":\"First option\"},{\"id\":\"69cd75ba\",\"name\":\"Second option\",\"name_html\":
  \"Second option\"}]}"
}
```

For example, here I want the issues labeled `manhattan` to be moved to board `PN_kwHOAmFUEs4AAzKJ`.
This issue will have the value `Second option` (`69cd75ba`) to the field `My field` (`MDE2OlByb2plY3ROZXh0RmllbGQxNzY0OTcy`).

```yaml
name: Add issue to boards based on issue labels

on:
  issues:
      types: [labeled]

jobs:
  add-to-board:
    runs-on: ubuntu-latest
    steps:
        - uses: avocaddo/issue-label-move-to-board-action@1.0
          with:
             boards: |
                  #board={boardID},{fieldID},{fieldValueID}
                  manhattan=PN_kwHOAmFUEs4AAzKJ,"MDE2OlByb2plY3ROZXh0RmllbGQxNzY0OTcy","69cd75ba"
```



