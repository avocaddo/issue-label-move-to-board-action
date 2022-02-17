# GitHub Action - Issue Label Move to Board
This GitHub Action allows you to move add an issue to specific boards when specific labels are added to an issue. It runs every time a label is attached to an issue, and compares the label to the associated list of boards you specified. If a match is found, the action will add the issue to the given board.

![Screen Shot 2020-03-27 at 3 30 46 PM](https://user-images.githubusercontent.com/1865328/77805832-19b91800-7040-11ea-98c8-5eb880be04f7.png)

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
  notify:
    runs-on: ubuntu-latest
    steps:
        - uses: avocaddo/issue-label-move-to-board-action@1.0
          with:
             boards: |
                  manhattan=PN_kwHOAmFUEs4AAzzzzz #Obtained from above example
                  brooklyn=PN_kwHOAmFUdfsFfAAz234 #Another board ID


                  manhattan=PN_kwHOAmFUEs4AAzKJ
                  brooklyn=PN_kwHOAmFUEs4AAzKZ
