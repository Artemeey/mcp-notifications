import path from 'node:path'

// Преобразует пути WSL (/mnt/c/...) в Windows-формат (C:\...).
export const normalizeIconPath = (iconPath) => {
	const resolved = path.resolve(iconPath)
	const mntMatch = resolved.match(/^\/mnt\/([a-zA-Z])\/(.*)$/)
	if (mntMatch) {
		const drive = mntMatch[1].toUpperCase()
		const rest = mntMatch[2].replace(/\//g, '\\')
		return `${drive}:\\${rest}`
	}

	return resolved
}

// Определяет запуск в WSL, чтобы выбрать отправку через PowerShell-обёртку.
export const isWsl = () =>
	process.platform === 'linux' &&
	(Boolean(process.env.WSL_DISTRO_NAME) || process.env.WSL_INTEROP !== undefined)
