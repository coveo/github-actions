# `verify-changelogs`

> This actions validate the format and the presence of the text file in the specified directory. It is only used in the pull-request. 

## Format rules

```
1) Each line starts with `-`
2) Include the corresponding Jira ticket code at the end of the line in square brackets

```
### Example
```text
- *feature(Spinnaker)*: Slack notification at the start of a manual phase [EX-1234]
- *fix(Somewhere)*: Llamas will no longer appear on-screen when a new pipeline is made [EX-5678]
```