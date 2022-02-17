const { correctBoards, correctMessage } = require('./utils');

test('changes nothing when configuration is correct', () => {
  const complexInput = `@docs-team @docs-team
  @docs-team @docs-team
  @docs-team @docs-team
  @docs-team @docs-team
  @docs-team  @docs-team
  @docs-team		@docs-team`;

  expect(correctBoards(complexInput)).toBe(complexInput);
  expect(correctBoards('@docs-team')).toBe('@docs-team');
  expect(correctBoards('@1234')).toBe('@1234');
});

test('adds missing ambersands', () => {
  const input = `@docs-team docs-team
  docs-team @docs-team
  docs-team docs-team
  @docs-team @docs-team
  @docs-team  docs-team
  @docs-team		docs-team
  1234 @1234`

  const output = `@docs-team @docs-team
  @docs-team @docs-team
  @docs-team @docs-team
  @docs-team @docs-team
  @docs-team  @docs-team
  @docs-team		@docs-team
  @1234 @1234`;

  expect(correctBoards(input)).toBe(output);
});

test('formats message when configuration is correct', () => {
  const input = 'Heads up {recipients} - the "{label}" label was applied to this issue.';
  const recipients = '@docs-team @1234';
  const label = 'documentation';

  const output = 'Heads up @docs-team @1234 - the "documentation" label was applied to this issue.';

  expect(correctMessage(input, recipients, label)).toBe(output);
});
