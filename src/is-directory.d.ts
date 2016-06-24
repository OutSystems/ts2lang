// Type definitions for is-directory
// Project: https://www.npmjs.com/package/is-directory
// Definitions by: Miguel Ventura <miguel.ventura@gmail.com>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface IsDirectory {
    (path: string, callback: (err: Error, isDir: boolean) => void);
    sync(path: string): boolean;
}

declare module 'is-directory' {
    var isDirectory: IsDirectory;
    export = isDirectory;
}