import {describe, it, afterEach} from 'mocha';
import {
  getGitFileData,
  getAllDiffs,
  parseChanges,
  findRepoRoot,
  resolvePath,
} from '../src/bin/handle-git-dir-change';
  const absoluteGitDir = process.cwd() + relativeGitDir;
    const stubReadFile = sandbox.stub(fs, 'readFile').resolves('Text');
    const stubReadFile = sandbox.stub(fs, 'readFile').yields(null, 'Text');
    const stubReadFile = sandbox.stub(fs, 'readFile').yields(null, 'new text');
    const gitDiffTxtModified =
      ':100644 100644 0000000 8e6c063 M\tmodified/test.txt';
    const gitFileDataModified = await getGitFileData(
      absoluteGitDir,
      gitDiffTxtModified
    );
      .stub(fs, 'readFile')
      .yields(null, '#!/bin/bash');
    const gitDiffTxtToExecutable =
      ':100644 100755 3b18e51 3b18e51 M\tbin/main/test.exe';
    const gitFileDataTxtToExecutable = await getGitFileData(
      absoluteGitDir,
      gitDiffTxtToExecutable
    );
describe('Repository root', () => {
  const dir = '/some/dir';
  const sandbox = sinon.createSandbox();
  afterEach(() => {
    // undo all changes
    sandbox.restore();
  });
  it('Executes the git find root bash command', () => {
    const stubGitDiff = sandbox
      .stub(child_process, 'execSync')
      .returns(Buffer.from(dir));
    findRepoRoot(dir);
    sinon.assert.calledOnceWithExactly(
      stubGitDiff,
      'git rev-parse --show-toplevel',
      {cwd: dir}
    );
  });
});

describe('Path resolving', () => {
  const absoluteGitDir = process.cwd() + '/test/fixtures';

  it("Resolves to absolute path when '..' is a prefix", () => {
    const relativeGitDir = '../code-suggester/test/fixtures';
    expect(resolvePath(relativeGitDir)).equals(absoluteGitDir);
  });

  it("Resolves to absolute path when './' is a prefix", () => {
    const relativeGitDir = './test/fixtures';
    expect(resolvePath(relativeGitDir)).equals(absoluteGitDir);
  });

  it('Resolves to absolute path when the leading chars are letters', () => {
    const relativeGitDir = 'test/fixtures';
    expect(resolvePath(relativeGitDir)).equals(absoluteGitDir);
  });
});

describe('Finding repository root', () => {
  const sandbox = sinon.createSandbox();
  afterEach(() => {
    sandbox.restore();
  });

  it('Removes the \\n character', () => {
    sandbox
      .stub(child_process, 'execSync')
      .returns(Buffer.from('/home/user/work\n'));
    expect(findRepoRoot('home/user/work/subdir')).equals('/home/user/work');
  });

  it('Rethrows execsync error', () => {
    sandbox.stub(child_process, 'execSync').throws(Error('Execsync error'));
    try {
      findRepoRoot('home/user/work/subdir');
      assert.fail();
    } catch (err) {
      assert.isOk(true);
      expect(err.message).equals('Execsync error');
    }
  });
  const testDir = process.cwd() + '/fixtures';
  it('splits file diff into a list and removed \\n', async () => {
    sandbox
      .returns(
        Buffer.from(
          ':000000 100644 0000000 8e6c063 A\tadded.txt\n:100644 000000 8e6c063 0000000 D\tdeleted.txt\n'
        )
      );
    const diffs = getAllDiffs(testDir);
    expect(diffs[0]).equals(':000000 100644 0000000 8e6c063 A\tadded.txt');
    expect(diffs[1]).equals(':100644 000000 8e6c063 0000000 D\tdeleted.txt');
    expect(diffs.length).equals(2);
  });
});

describe('parse changes', () => {
  const testDir = '/test/dir';
  const sandbox = sinon.createSandbox();
  const diffs = [
    ':000000 100644 0000000 8e6c063 A\tadded.txt',
    ':100644 000000 8e6c063 0000000 D\tdeleted.txt',
  ];
  afterEach(() => {
    // undo all changes
    sandbox.restore();
  });
  it('populates change object with everything from a diff output', async () => {
    sandbox.stub(fs, 'readFile').yields(null, 'new text');
    const changes = await parseChanges(diffs, testDir);
    expect(changes.get('added.txt')?.mode).equals('100644');
    expect(changes.get('added.txt')?.content).equals('new text');
    expect(changes.get('deleted.txt')?.mode).equals('100644');
    expect(changes.get('deleted.txt')?.content).is.null;
    sandbox.stub(fs, 'readFile').throws(Error());
    try {
      await parseChanges(diffs, '');
      assert.fail();
    } catch (err) {
      assert.isOk(true);
    }
  });
  it('Passes up the error message with a throw when reading the file fails', async () => {
    // setup
    sandbox.stub(fs, 'readFile').yields(Error(), '');
    try {
      await parseChanges(diffs, '');
      assert.fail();
    } catch (err) {
      assert.isOk(true);
    }
  });
  it('Passes up the error message with a throw when parsing the diff fails', async () => {
    // setup
      const badDiff = [':000000 100644 0000000 8e6c063 Aadded.txt'];
      await parseChanges(badDiff, '');