// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {expect} from 'chai';
import {describe, it, before, afterEach} from 'mocha';
import {octokit, setup} from './util';
import * as sinon from 'sinon';
import {
  makeInlineSuggestions,
  buildReviewComments,
  PullsCreateReviewParamsComments,
} from '../src/github-handler/comment-handler/valid-patch-handler/upload-comments-handler';
import {Patch} from '../src/types';

before(() => {
  setup();
});

describe('buildFileComments', () => {
  it('Maps patches to GitHub comment object types', () => {
    const suggestions: Map<string, Patch[]> = new Map();
    const fileName1 = 'foo.txt';
    const patch1: Patch = {
      start: 1,
      end: 2,
      newContent: 'Foo',
    };
    suggestions.set(fileName1, [patch1]);
    const comments = buildReviewComments(suggestions);
    expect(comments).deep.equals([
      {
        body: '```suggestion\nFoo```',
        path: 'foo.txt',
        start_line: 1,
        line: 2,
        side: 'RIGHT',
        start_side: 'RIGHT',
      },
    ]);
  });
  it('Maps multiple patches to GitHub comment object types', () => {
    const suggestions: Map<string, Patch[]> = new Map();
    const fileName1 = 'foo.txt';
    const fileName2 = 'bar.txt';
    const patch1: Patch = {
      start: 1,
      end: 2,
      newContent: 'Foo',
    };
    const patch2: Patch = {
      start: 3,
      end: 4,
      newContent: 'Bar',
    };
    suggestions.set(fileName2, [patch1]);
    suggestions.set(fileName1, [patch1, patch2]);
    const comments = buildReviewComments(suggestions);
    expect(comments).deep.equals([
      {
        body: '```suggestion\nFoo```',
        path: 'bar.txt',
        start_line: 1,
        line: 2,
        side: 'RIGHT',
        start_side: 'RIGHT',
      },
      {
        body: '```suggestion\nFoo```',
        path: 'foo.txt',
        start_line: 1,
        line: 2,
        side: 'RIGHT',
        start_side: 'RIGHT',
      },
      {
        body: '```suggestion\nBar```',
        path: 'foo.txt',
        start_line: 3,
        line: 4,
        side: 'RIGHT',
        start_side: 'RIGHT',
      },
    ]);
  });
  it('Maps empty suggestion to empty list', () => {
    const suggestions: Map<string, Patch[]> = new Map();
    const comments = buildReviewComments(suggestions);
    expect(comments.length).deep.equals(0);
  });
});

describe('makeInlineSuggestions', () => {
  const sandbox = sinon.createSandbox();
  const suggestions: Map<string, Patch[]> = new Map();
  afterEach(() => {
    sandbox.restore();
    suggestions.clear();
  });
  const fileName1 = 'foo.txt';
  const patch1: Patch = {
    start: 1,
    end: 2,
    newContent: 'Foo',
  };
  const remote = {owner: 'upstream-owner', repo: 'upstream-repo'};
  const pullNumber = 711;
  it('Calls Octokit with the correct values', async () => {
    suggestions.set(fileName1, [patch1]);
    const responseData = await import(
      './fixtures/get-pull-request-response.json'
    );
    const getPullRequestResponse = {
      headers: {},
      status: 200,
      url: 'http://fake-url.com',
      data: responseData,
    };
    // setup
    const stubGetPulls = sandbox
      .stub(octokit.pulls, 'get')
      .resolves(getPullRequestResponse);

    const stubCreateReview = sandbox.stub(octokit.pulls, 'createReview');
    // tests

    await makeInlineSuggestions(octokit, suggestions, remote, pullNumber);
    sandbox.assert.calledOnceWithExactly(stubGetPulls, {
      owner: remote.owner,
      repo: remote.repo,
      pull_number: pullNumber,
    });
    sandbox.assert.calledOnceWithExactly(stubCreateReview, {
      owner: remote.owner,
      repo: remote.repo,
      pull_number: pullNumber,
      commit_id: '6dcb09b5b57875f334f61aebed695e2e4193db5e',
      comments: ([
        {
          body: '```suggestion\nFoo```',
          path: 'foo.txt',
          start_line: 1,
          line: 2,
          side: 'RIGHT',
          start_side: 'RIGHT',
        },
      ] as unknown) as PullsCreateReviewParamsComments[],
      event: 'COMMENT',
      headers: {accept: 'application/vnd.github.comfort-fade-preview+json'},
    });
  });
  it('Does not call octokit at all when there are no suggestions', async () => {
    // setup
    const stubGetPulls = sandbox.stub(octokit.pulls, 'get');

    const stubCreateReview = sandbox.stub(octokit.pulls, 'createReview');
    // tests

    await makeInlineSuggestions(octokit, new Map(), remote, pullNumber);
    sandbox.assert.notCalled(stubGetPulls);
    sandbox.assert.notCalled(stubCreateReview);
  });
  it('Throws and does not continue when get pull request fails', async () => {
    // setup
    suggestions.set(fileName1, [patch1]);
    const stubGetPulls = sandbox
      .stub(octokit.pulls, 'get')
      .rejects(new Error());

    const stubCreateReview = sandbox.stub(octokit.pulls, 'createReview');
    // tests
    try {
      await makeInlineSuggestions(octokit, suggestions, remote, pullNumber);
      expect.fail('Should have failed because get pull request failed');
    } catch (err) {
      sandbox.assert.called(stubGetPulls);
      sandbox.assert.notCalled(stubCreateReview);
    }
  });
  it('Throws when create review comments fails', async () => {
    // setup
    suggestions.set(fileName1, [patch1]);
    const responseData = await import(
      './fixtures/get-pull-request-response.json'
    );
    const getPullRequestResponse = {
      headers: {},
      status: 200,
      url: 'http://fake-url.com',
      data: responseData,
    };
    // setup
    const stubGetPulls = sandbox
      .stub(octokit.pulls, 'get')
      .resolves(getPullRequestResponse);

    const stubCreateReview = sandbox
      .stub(octokit.pulls, 'createReview')
      .rejects(new Error());
    // tests
    try {
      await makeInlineSuggestions(octokit, suggestions, remote, pullNumber);
      expect.fail(
        'Should have failed because create pull request review failed'
      );
    } catch (err) {
      sandbox.assert.called(stubGetPulls);
      sandbox.assert.called(stubCreateReview);
    }
  });
});