import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { locatePathSync } from './locate-path'
import type { LocatePathOptions } from './locate-path'
import type { PathType } from './locate-path'

const toPath = (urlOrPath?: string | URL) =>
  urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath

export type Match = string | undefined

export interface Options extends LocatePathOptions {
  limit?: number
  /**
    The path to the directory to stop the search before reaching root if there were no matches before the `stopAt` directory.
    @default path.parse(cwd).root
    */
  readonly stopAt?: string
}

interface LocateOptions {
  cwd?: string | undefined
  type?: PathType | undefined
  allowSymlinks?: boolean | undefined
}

export function findUpMultipleSync(
  name: string | readonly string[],
  options: Options = {}
) {
  let directory = path.resolve(toPath(options.cwd) || '')
  const { root } = path.parse(directory)
  const stopAt = options.stopAt || root
  const limit = options.limit || Number.POSITIVE_INFINITY
  const paths = [name].flat()

  const runMatcher = (locateOptions: LocateOptions | undefined) => {
    return locatePathSync(paths, locateOptions)
  }

  const matches = []
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const foundPath = runMatcher({ ...options, cwd: directory })

    if (foundPath) {
      matches.push(path.resolve(directory, foundPath))
    }

    if (directory === stopAt || matches.length >= limit) {
      break
    }

    directory = path.dirname(directory)
  }

  return matches
}

/**
Synchronously find a file or directory by walking up parent directories.
@see https://github.com/sindresorhus/find-up
@param name - The name of the file or directory to find. Can be multiple.
@returns The first path found (by respecting the order of `name`s) or `undefined` if none could be found.
@example
```
// /
// └── Users
//     └── sindresorhus
//         ├── unicorn.png
//         └── foo
//             └── bar
//                 ├── baz
//                 └── example.js
// example.js
import {findUpSync} from 'find-up';
console.log(findUpSync('unicorn.png'));
//=> '/Users/sindresorhus/unicorn.png'
console.log(findUpSync(['rainbow.png', 'unicorn.png']));
//=> '/Users/sindresorhus/unicorn.png'
```
*/
export function findUpSync(
  name: string | readonly string[],
  options: Options = {}
) {
  const matches = findUpMultipleSync(name, { ...options, limit: 1 })
  return matches[0]
}
