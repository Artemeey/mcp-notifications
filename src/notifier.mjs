import {spawn, spawnSync} from 'node:child_process'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import notifier from 'node-notifier'
import {isWsl, normalizeIconPath} from './utils.mjs'

const jobs = []
let isProcessing = false
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DEFAULT_ICON_PATH = path.resolve(__dirname, '../assets/topvisor-robot.png')
const WINDOWS_WRAPPER_PATH = path.resolve(__dirname, './send-via-powershell.mjs')

export const enqueueNotification = ({title, message, sound, icon, appID}) => {
	jobs.push({
		title,
		message,
		sound,
		icon: normalizeIconPath(icon || DEFAULT_ICON_PATH),
		wait: false,
		appID,
	})
	processQueue()
}

const processQueue = () => {
	if (isProcessing) return
	const job = jobs.shift()
	if (!job) return

	isProcessing = true
	sendNotification(job, (error) => {
		isProcessing = false
		if (error) {
			console.error('[notify] Ошибка отправки уведомления:', error.message)
		}
		setImmediate(processQueue)
	})
}

const sendNotification = (job, done) => {
	if (isWsl()) {
		sendViaPowershellWrapper(job, done)
		return
	}

	notifier.notify(job, (error) => done(error ?? null))
}

const sendViaPowershellWrapper = (job, done) => {
	const wrapperWindowsPath = toWindowsPath(WINDOWS_WRAPPER_PATH)
	if (!wrapperWindowsPath) {
		done(new Error('Cannot resolve Windows path for notifier wrapper'))
		return
	}

	const payload = Buffer.from(JSON.stringify(job), 'utf8').toString('base64')
	const command = `node "${wrapperWindowsPath}" "${payload}"`
	const child = spawn('powershell.exe', ['-NoProfile', '-Command', command], {stdio: 'ignore'})
	child.on('error', (error) => done(error))
	child.on('exit', (code) => done(code === 0 ? null : new Error(`powershell exited with code ${code}`)))
}

const toWindowsPath = (linuxPath) => {
	const converted = spawnSync('wslpath', ['-w', linuxPath], {encoding: 'utf8'})
	if (converted.status !== 0) {
		return null
	}
	return converted.stdout.trim() || null
}
