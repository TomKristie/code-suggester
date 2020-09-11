// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {CreatePullRequestSettings, CreatePullRequestUserOptions} from './types';

const DEFAULT_BRANCH_NAME = 'code-suggestions';
const DEFAULT_PRIMARY_BRANCH = 'master';

/**
 * Add defaults to GitHub Pull Request options.
 * Preserves the empty string.
 * For ESCMAScript, null/undefined values are preserved for required fields.
 * Recommended with an object validation function to check empty strings and incorrect types.
 * @param {PullRequestUserOptions} options the user-provided github pull request options
 * @returns {CreatePullRequestSettings} git hub context with defaults applied
 */
function addPullRequestDefaults(
  options: CreatePullRequestUserOptions
): CreatePullRequestSettings {
  const pullRequestSettings: CreatePullRequestSettings = {
    upstreamOwner: options.upstreamOwner,
    upstreamRepo: options.upstreamRepo,
    description: options.description,
    title: options.title,
    message: options.message,
    force: options.force || false,
    fork: options.fork === false ? false : true,
    branch:
      typeof options.branch === 'string' ? options.branch : DEFAULT_BRANCH_NAME,
    primary:
      typeof options.primary === 'string'
        ? options.primary
        : DEFAULT_PRIMARY_BRANCH,
    maintainersCanModify: options.maintainersCanModify === false ? false : true,
  };
  return pullRequestSettings;
}

export {addPullRequestDefaults};
