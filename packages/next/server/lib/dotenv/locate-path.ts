import process from 'node:process'
import path from 'node:path'
import { lstatSync, statSync } from 'node:fs'
import type { Stats } from 'node:fs'
import { fileURLToPath } from 'node:url'

export type PathType = 'file' | 'directory'

export interface LocatePathOptions {
  /**
   * The current working directory.
   * @default process.cwd()
   */
  readonly cwd?: URL | string
  /**
   * The type of path to match.
   * @default 'file'
   */
  readonly type?: PathType
  /**
   * Allow symbolic links to match if they point to the requested path type.
   * @default true
   */
  readonly allowSymlinks?: boolean
}

const typeMappings = {
  directory: 'isDirectory',
  file: 'isFile',
} as const

function checkType(type: string | number) {
  if (Object.hasOwnProperty.call(typeMappings, type)) {
    return
  }

  throw new Error(`Invalid type specified: ${type}`)
}

const matchType = (type: PathType, stat: Stats) => stat[typeMappings[type]]()

const toPath = (urlOrPath: string | URL) =>
  urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath

/**
 * Synchronously get the first path that exists on disk of multiple paths.
 * @see https://github.com/sindresorhus/locate-path
 * @param paths - The paths to check.
 * @returns The first path that exists or `undefined` if none exists.
 * @example
 * ```
 * import {locatePathSync} from 'locate-path';
 * const files = [
 *     'unicorn.png',
 *     'rainbow.png', // Only this one actually exists on disk
 *     'pony.png'
 * ];
 * console(locatePathSync(files));
 * //=> 'rainbow'
 * ```
 */
export function locatePathSync(
  paths: string[],
  {
    cwd = process.cwd(),
    type = 'file',
    allowSymlinks = true,
  }: LocatePathOptions = {}
) {
  checkType(type)
  cwd = toPath(cwd)

  const statFunction = allowSymlinks ? statSync : lstatSync

  for (const path_ of paths) {
    try {
      const stat = statFunction(path.resolve(cwd, path_))

      if (matchType(type, stat)) {
        return path_
      }
    } catch {}
  }
}
