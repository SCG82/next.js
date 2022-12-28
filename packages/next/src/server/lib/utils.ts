import type arg from 'next/dist/compiled/arg/index.js'

export function printAndExit(message: string, code = 1) {
  if (code === 0) {
    console.log(message)
  } else {
    console.error(message)
  }

  process.exit(code)
}

export function getNodeOptionsWithoutInspect() {
  const NODE_INSPECT_RE = /--inspect(-brk)?(=\S+)?( |$)/
  return (process.env.NODE_OPTIONS || '').replace(NODE_INSPECT_RE, '')
}

type Log = {
  info: (...args: any[]) => void
  error: (...args: any[]) => void
}

interface GetPortOptions {
  dir?: string
  log?: Log
}

export function getPort(
  args: arg.Result<arg.Spec>,
  options: GetPortOptions = {}
): number {
  if (typeof args['--port'] === 'number') {
    return args['--port']
  }

  if (args['--readDotEnv']) {
    const { dir, log } = options
    const isDev = process.env.NODE_ENV === 'development'
    const isTest = process.env.NODE_ENV === 'test'
    const mode = isTest ? 'test' : isDev ? 'development' : 'production'
    const { getDotEnvFilenames, loadEnvConfig } =
      require('@next/env') as typeof import('@next/env')
    const findUp =
      require('next/dist/compiled/find-up') as typeof import('next/dist/compiled/find-up')
    const dotenvFiles = getDotEnvFilenames(mode)
    const envPath = findUp.sync(dotenvFiles, { cwd: dir })
    if (envPath) {
      const { dirname } = require('path') as typeof import('path')
      loadEnvConfig(dirname(envPath), isDev, log)
    }
  }

  const parsed = process.env.PORT && parseInt(process.env.PORT, 10)
  if (typeof parsed === 'number' && !Number.isNaN(parsed)) {
    return parsed
  }

  return 3000
}
