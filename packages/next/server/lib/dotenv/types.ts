export interface DotenvConfigOptions {
  /**
   * Turn on logging to help debug why certain keys or values are not being set as you expect.
   * @default false
   * @example
   * ```js
   * import { config } from '@mfc/dotenv/config'
   * config({ debug: process.env.DEBUG === 'true' })
   * ```
   */
  debug?: boolean

  /**
   * Specify the encoding of your file containing environment variables.
   * @default 'utf8'
   * @example
   * ```js
   * import { config } from '@mfc/dotenv/config'
   * config({ encoding: 'latin1' })
   * ```
   */
  encoding?: BufferEncoding

  /**
   * Override any environment variables that have already been set on your machine with values from your .env file.
   * @default false
   * ```js
   * import { config } from '@mfc/dotenv/config'
   * config({ override: true })
   * ```
   */
  override?: boolean

  /**
   * Specify a custom path if your file containing environment variables is located elsewhere.
   * @default
   * ```js
   * path.resolve(process.cwd(), '.env')
   * ```
   * @example
   * ```js
   * import { config } from '@mfc/dotenv/config'
   * config({ path: '/custom/path/to/.env' })
   * ```
   */
  path?: string
}

export type DotenvParseOutput = Record<string, string>

export interface DotenvConfigOutput {
  error?: Error
  parsed?: DotenvParseOutput
}
