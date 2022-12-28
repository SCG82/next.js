import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { cwd } from 'node:process'
import { parse } from './parse'
import type { DotenvConfigOptions, DotenvConfigOutput } from './types'

function _log(message: string) {
  console.log('[dotenv][DEBUG]', message)
}

function _resolveHome(envPath: string) {
  return envPath.startsWith('~') ? join(homedir(), envPath.slice(1)) : envPath
}

/**
 * Loads `.env` file contents into process.env.
 *
 * Derived from https://github.com/motdotla/dotenv
 *
 * See https://docs.dotenv.org
 *
 * @param options - additional options. example: `{ path: './custom/path', encoding: 'latin1', debug: true, override: false }`
 * @returns an object with a `parsed` key if successful or `error` key if an error occurred. example: { parsed: { KEY: 'value' } }
 */
export function dotenv(options: DotenvConfigOptions = {}): DotenvConfigOutput {
  const { debug, override, path } = options

  const dotenvPath = path ? _resolveHome(path) : resolve(cwd(), '.env')
  const encoding = options.encoding ?? 'utf8'

  try {
    const fileContents = readFileSync(dotenvPath, { encoding })
    const parsed = parse(fileContents)

    Object.keys(parsed).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
        process.env[key] = parsed[key]
      } else {
        if (override) {
          process.env[key] = parsed[key]
        }
        if (debug) {
          const action = override ? 'WAS' : 'WAS NOT'
          const msg = `"${key}" is already defined in \`process.env\` and ${action} overwritten`
          _log(msg)
        }
      }
    })

    return { parsed }
  } catch (e) {
    const error = e as Error
    if (debug) {
      _log(`Failed to load ${dotenvPath} ${error.message}`)
    }

    return { error }
  }
}
