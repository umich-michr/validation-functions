/** @type {import('cz-git').UserConfig} */
const { execSync } = require('child_process');
// @tip: git branch name = feature#33   =>    auto get defaultIssues = #33
const issue = execSync('git rev-parse --abbrev-ref HEAD')
  .toString()
  .trim()
  .split("#")[1];

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // @see: https://commitlint.js.org/#/reference-rules
    'references-empty': [2, 'never'],
    'header-max-length': [2, "always", 500]
  },
  parserPreset: {
    parserOpts: {
      issuePrefixes: ['#']
    }
  },
  prompt: {
    alias: { fd: 'docs: fix typos' },
    messages: {
      type: 'Select the type of change that you\'re committing:',
      scope: 'Denote the SCOPE of this change (optional):',
      customScope: 'Denote the SCOPE of this change:',
      subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
      body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
      markBreaking: 'Is there any breaking changes?\n',
      breaking: 'List any BREAKING CHANGES (optional). Use "|" to break new line:\n',
      footerPrefixsSelect: 'Select the ISSUES type of changeList by this change (optional):',
      customFooterPrefixs: 'Input ISSUES prefix:',
      footer: 'List any ISSUES by this change. E.g.: #31, #34:\n',
      confirmCommit: 'Are you sure you want to proceed with the commit above?'
    },
    types: [
      { value: 'feat', name: 'feat:     A new feature', emoji: ':sparkles:' },
      { value: 'fix', name: 'fix:      A bug fix', emoji: ':bug:' },
      { value: 'docs', name: 'docs:     Documentation only changes', emoji: ':memo:' },
      { value: 'style', name: 'style:    Changes that do not affect the meaning of the code', emoji: ':lipstick:' },
      { value: 'refactor', name: 'refactor: A code change that neither fixes a bug nor adds a feature', emoji: ':recycle:' },
      { value: 'perf', name: 'perf:     A code change that improves performance', emoji: ':zap:' },
      { value: 'test', name: 'test:     Adding missing tests or correcting existing tests', emoji: ':white_check_mark:' },
      { value: 'build', name: 'build:    Changes that affect the build system or external dependencies', emoji: ':package:' },
      { value: 'ci', name: 'ci:       Changes to our CI configuration files and scripts', emoji: ':ferris_wheel:' },
      { value: 'chore', name: 'chore:    Other changes that don\'t modify src or test files', emoji: ':hammer:' },
      { value: 'revert', name: 'revert:   Reverts a previous commit', emoji: ':rewind:' }
    ],
    useEmoji: false,
    emojiAlign: 'center',
    themeColorCode: '',
    scopes: ['form','validation-functions','HOC', 'unitTest', 'componentTest', 'projectSetup'],
    enableMultipleScopes: true,
    scopeEnumSeparator: ',',
    allowCustomScopes: false,
    allowEmptyScopes: true,
    customScopesAlign: 'bottom',
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    upperCaseSubject: false,
    markBreakingChangeMode: true,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
    skipQuestions: ['breaking'],
    issuePrefixs: [{ value: 'refs', name: 'references: References the issues (should provide comma separated ticket numbers prefixed with #)' },
                   { value: 'closes', name: 'closes: Closes the issues (should provide comma separated ticket numbers prefixed with #)' }],
    defaultFooterPrefix: "refs",
    customIssuePrefixsAlign: !issue ? "top" : "bottom",
    emptyIssuePrefixsAlias: 'skip',
    customIssuePrefixsAlias: 'custom',
    allowCustomIssuePrefixs: false,
    allowEmptyIssuePrefixs: false,
    confirmColorize: true,
    maxHeaderLength: 500,
    maxSubjectLength: Infinity,
    minSubjectLength: 0,
    scopeOverrides: undefined,
    defaultBody: '',
    defaultIssues: !issue ? "" : `#${issue}`,
    defaultScope: '',
    defaultSubject: ''
    // @see https://cz-git.qbb.sh/config/engineer.html#formatmessagecb if you like to modify the commit message produced after responses to prompts are collected.
  }
}
