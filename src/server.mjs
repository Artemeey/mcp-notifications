import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { enqueueNotification } from './notifier.mjs';

const server = new McpServer({
	name: 'mcp-notifications',
	version: '1.0.0',
});

server.tool(
	'send_notification',
	{
		title: z.string().min(1),
		message: z.string().min(1),
		play_sound: z.boolean().optional(),
		icon: z.string().min(1).optional(),
		app_id: z.string().min(1).optional(),
	},
	async ({ title, message, play_sound, icon, app_id }) => {
		const playSound = play_sound ?? false;
		const appId = app_id ?? process.env.MCP_NOTIFICATIONS_APP_ID;

		enqueueNotification({
			title,
			message,
			playSound,
			icon,
			appId,
		});

		return {
			content: [
				{
					type: 'text',
					text: 'Notification queued',
				},
			],
		};
	},
);

const transport = new StdioServerTransport();
await server.connect(transport);
