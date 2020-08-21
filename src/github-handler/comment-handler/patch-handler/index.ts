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

import {generatePatches} from './hunk-to-patch-handler';
import {getValidSuggestionHunks} from './in-scope-hunks-handler';
import {Hunk, RawContent, Range, Patch} from '../../../types';

interface PatchesAndOutOfScopeSuggestions {
  filePatches: Map<string, Patch[]>;
  outOfScopeSuggestions: Map<string, Hunk[]>;
}

/**
 * Get the range of the old version of every file and the corresponding new text for that range
 * whose old and new contents differ, under the constraints that the file
 * is in scope for Pull Request, as well as its lines.
 * @param {Map<string, RawContent>} rawChanges the raw old content and new content of a file
 * @param {string[]} invalidFiles list of invalid files
 * @param {Map<string, Range[]>} validFileLines a map of each file's in scope lines for a Pull Request
 */
export function getSuggestionPatches(
  rawChanges: Map<string, RawContent>,
  invalidFiles: string[],
  validFileLines: Map<string, Range[]>
): PatchesAndOutOfScopeSuggestions {
  const {inScopeSuggestions, outOfScopeSuggestions} = getValidSuggestionHunks(
    rawChanges,
    invalidFiles,
    validFileLines
  );
  const filePatches: Map<string, Patch[]> = generatePatches(
    inScopeSuggestions,
    rawChanges
  );
  return {filePatches, outOfScopeSuggestions};
}
