import type { DotenvParseOutput } from './types'

const LINE =
  /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm

/**
 * Parses a string or buffer in the .env file format into an object.
 *
 * See https://docs.dotenv.org
 *
 * @param src - contents to be parsed. example: `'DB_HOST=localhost'`
 */
export function parse<T extends DotenvParseOutput = DotenvParseOutput>(
  src: string | Buffer
): T {
  const obj = {} as T
  let lines = src.toString()
  // Convert CRLF line breaks to LF
  lines = lines.replace(/\r\n?/gm, '\n')

  let match: RegExpExecArray | null = null
  while ((match = LINE.exec(lines)) !== null) {
    const key = match[1] as keyof T
    // Default undefined or null to empty string and remove whitespace
    let value = (match[2] ?? '').trim()
    const isDoubleQuoted = value.startsWith('"')
    // Remove surrounding quotes
    value = value.replace(/^(['"`])([\s\S]*)\1$/gm, '$2')
    // Expand newlines if double quoted
    if (isDoubleQuoted) {
      value = value.replace(/\\n/g, '\n')
      value = value.replace(/\\r/g, '\r')
    }
    // Add to object
    obj[key] = value as T[keyof T]
  }

  return obj
}
