import {describe, it, before, afterEach} from 'mocha';
// .true triggers ts-lint failure, but is valid chai
  it('does not read from a file if the file status is deleted and uses the old mode', async () => {
  it('gets the new file mode, content and path for created files', async () => {
  it('gets the new file mode, content and path for content modified files', async () => {
  it('gets the new file mode, content and path for mode modified files', async () => {
  const absoluteGitDirLinux = process.cwd() + '/test/fixtures';
  const absoluteGitDirDos = process.cwd() + '\\test\\fixtures';
    const path = resolvePath(relativeGitDir);
    expect(path === absoluteGitDirLinux || path === absoluteGitDirDos).true;
    const path = resolvePath(relativeGitDir);
    expect(path === absoluteGitDirLinux || path === absoluteGitDirDos).true;
    const path = resolvePath(relativeGitDir);
    expect(path === absoluteGitDirLinux || path === absoluteGitDirDos).true;