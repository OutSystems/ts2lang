// Type definitions for merge
// Project: https://www.npmjs.com/package/merge
// Definitions by: Miguel Ventura <miguel.ventura@gmail.com>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface MergeFunction {
    (...objects: Object[]): Object;
    (clone: boolean, ...objects: Object[]): Object;
}

interface MergeModule extends MergeFunction {
    recursive: MergeFunction;
}

declare module 'merge' {
    var merge: MergeModule;
    export = merge;
}