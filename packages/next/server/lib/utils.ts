import { dirname } from 'node:path'
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

export function getPort(args: arg.Result<arg.Spec>, log?: Log): number {
  if (typeof args['--port'] === 'number') {
    return args['--port']
  }

  if (args['--readDotEnv']) {
    const findUp =
      require('next/dist/compiled/find-up') as typeof import('next/dist/compiled/find-up')
    const { getDotEnvFilenames, loadEnvConfig } =
      require('@next/env') as typeof import('@next/env')
    const isDev = process.env.NODE_ENV === 'development'
    const isTest = process.env.NODE_ENV === 'test'
    const mode = isTest ? 'test' : isDev ? 'development' : 'production'
    const dotenvFiles = getDotEnvFilenames(mode)
    const envPath = findUp.sync(dotenvFiles)
    if (envPath) {
      loadEnvConfig(dirname(envPath), isDev, log)
    }
  }

  const parsed = process.env.PORT && parseInt(process.env.PORT, 10)
  if (typeof parsed === 'number' && !Number.isNaN(parsed)) {
    return parsed
  }

  return 3000
}
