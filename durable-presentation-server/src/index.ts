import { DurableObject } from "cloudflare:workers";

export interface Env {
	WEBSOCKET_HIBERNATION_SERVER: DurableObjectNamespace<WebSocketHibernationServer>;
}

// Worker
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.url.endsWith("/websocket")) {
			// Expect to receive a WebSocket Upgrade request.
			// If there is one, accept the request and return a WebSocket Response.
			const upgradeHeader = request.headers.get('Upgrade');
			if (!upgradeHeader || upgradeHeader !== 'websocket') {
				return new Response('Durable Object expected Upgrade: websocket', { status: 426 });
			}

			// The URL look like /api/presentation/:id/websocket
			const url = new URL(request.url);
			const name = url.pathname.split('/')[2];
			let id = env.WEBSOCKET_HIBERNATION_SERVER.idFromName(name);
			let stub = env.WEBSOCKET_HIBERNATION_SERVER.get(id);

			return stub.fetch(request);
		}

		return new Response(null, {
			status: 400,
			statusText: 'Bad Request',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
};

// Durable Object
export class WebSocketHibernationServer extends DurableObject {
	async fetch(request: Request): Promise<Response> {
		// Creates two ends of a WebSocket connection.
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		// Calling `acceptWebSocket()` informs the runtime that this WebSocket is to begin terminating
		// request within the Durable Object. It has the effect of "accepting" the connection,
		// and allowing the WebSocket to send and receive messages.
		// Unlike `ws.accept()`, `state.acceptWebSocket(ws)` informs the Workers Runtime that the WebSocket
		// is "hibernatable", so the runtime does not need to pin this Durable Object to memory while
		// the connection is open. During periods of inactivity, the Durable Object can be evicted
		// from memory, but the WebSocket connection will remain open. If at some later point the
		// WebSocket receives a message, the runtime will recreate the Durable Object
		// (run the `constructor`) and deliver the message to the appropriate handler.
		this.ctx.acceptWebSocket(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
		// Upon receiving a message from the client, the server replies with the same message,
		// and the total number of connections with the "[Durable Object]: " prefix
		console.log("Received message from client: ", message);

		if (typeof message === 'string') {
			const data = JSON.parse(message);
			if (data.type === 'next') {
				await this.nextSlide();
			} else if (data.type === 'back') {
				await this.previousSlide();
			} else if (data.type === 'reset') {
				await this.ctx.storage.put('slideNumber', 0);
			}
		}

		this.broadcast({
			type: 'message',
			message: await this.getSlideNumber(),
		});
	}

	broadcast(message: string | object) {
		if (typeof message !== 'string') {
			message = JSON.stringify(message);
		}
		// Broadcast a message to all connected clients.
		for (const ws of this.ctx.getWebSockets()) {
			ws.send(message);
		}
	}

	async getSlideNumber(): Promise<number> {
		let value = (await this.ctx.storage.get('slideNumber')) as number || 0;
		return value;
	}

	async nextSlide() {
		let value = await this.getSlideNumber();
		value++;
		await this.ctx.storage.put('slideNumber', value);
	}

	async previousSlide() {
		let value = await this.getSlideNumber();
		if (value > 0) {
			value--;
		} else {
			value = 0;
		}
		await this.ctx.storage.put('slideNumber', value);
	}

	async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
		// If the client closes the connection, the runtime will invoke the webSocketClose() handler.
		ws.close(1011, "Durable Object is closing WebSocket");
	}
}