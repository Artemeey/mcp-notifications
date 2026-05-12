import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import notifier from 'node-notifier'
import {normalizeIconPath} from './utils.mjs'

const payloadBase64 = process.argv[2] || ''
if (!payloadBase64) process.exit(1)

let job
try {
	job = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'))
} catch {
	process.exit(1)
}

const icon = prepareIconPowerShell(job.icon)

notifier.notify(
	{
		title: job.title,
		message: job.message,
		wait: job.wait,
		sound: Boolean(job.sound),
		icon,
		appID: job.appID,
	},
	(error) => process.exit(error ? 1 : 0),
)

function prepareIconPowerShell(iconPath) {
	if (!iconPath) return undefined
	const resolved = normalizeIconPath(iconPath)
	if (!fs.existsSync(resolved)) return undefined
	if (!resolved.startsWith('\\\\wsl.localhost\\')) return resolved

	const ext = path.extname(resolved) || '.png'
	const target = path.join(os.tmpdir(), `mcp-notifications-icon${ext}`)
	fs.copyFileSync(resolved, target)
	return target
}
