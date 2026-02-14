import notifier from 'node-notifier';
import path from 'path';
import { fileURLToPath } from 'url';

const jobs = [];
let isProcessing = false;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ICON_PATH = path.resolve(__dirname, '../assets/topvisor-robot.png');

/**
 * Добавить уведомление в очередь фоновой отправки.
 * Tool-вызов не ждёт завершения системного API уведомлений.
 */
export const enqueueNotification = ({ title, message, playSound, icon, appId }) => {
	jobs.push({
		title,
		message,
		playSound,
		icon: normalizeIcon(icon),
		appId,
	});
	processQueue();
};

const processQueue = () => {
	if (isProcessing) return;

	const job = jobs.shift();
	if (!job) return;

	isProcessing = true;

	notifier.notify(
		{
			title: job.title,
			message: job.message,
			wait: false,
			sound: job.playSound,
			icon: job.icon,
			appID: job.appId,
		},
		(error) => {
			isProcessing = false;

			if (error) {
				console.error('[notify] Ошибка отправки уведомления:', error.message);
			}

			setImmediate(processQueue);
		},
	);
};

const normalizeIcon = (icon) => {
	if (!icon) {
		return DEFAULT_ICON_PATH;
	}

	return path.resolve(icon);
};
