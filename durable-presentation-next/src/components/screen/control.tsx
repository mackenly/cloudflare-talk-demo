'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './control.module.css';

const hostname = 'durable-presentation-server.mackenly.workers.dev';

export function Controller({ id, username = 'Anon' }: { id: string; username?: string | null | undefined }) {
	const [currentWebSocket, setCurrentWebSocket] = useState<WebSocket | null>(null);
	const hasJoined = useRef(false); // Track if join has been called

	id = id
		.replace(/[^a-zA-Z0-9_-]/g, '')
		.replace(/_/g, '-')
		.toLowerCase();
	if (id.length > 32 && !id.match(/^[0-9a-f]{64}$/)) {
		throw new Error('Invalid screen ID');
	}

	function join() {
		if (hasJoined.current) return; // Prevent multiple joins
		hasJoined.current = true;

		// If we are running via wrangler dev, use ws:
		const wss = document.location.protocol === 'http:' ? 'ws://' : 'wss://';
		let ws = new WebSocket(wss + hostname + '/api/room/' + id + '/websocket');
		let rejoined = false;
		let startTime = Date.now();

		let rejoin = async () => {
			if (!rejoined) {
				rejoined = true;
				setCurrentWebSocket(null);

				// Don't try to reconnect too rapidly.
				let timeSinceLastJoin = Date.now() - startTime;
				if (timeSinceLastJoin < 10000) {
					// Less than 10 seconds elapsed since last join. Pause a bit.
					await new Promise((resolve) => setTimeout(resolve, 10000 - timeSinceLastJoin));
				}

				// OK, reconnect now!
				hasJoined.current = false; // Allow rejoin
				join();
			}
		};

		ws.addEventListener('open', (event) => {
			setCurrentWebSocket(ws);

			// Send user info message.
			ws.send(JSON.stringify({ type: 'joined', name: username }));
		});

		ws.addEventListener('message', (event) => {
			let data = JSON.parse(event.data);
			data = JSON.parse(data.message);
			console.log(data);
			const type = data.type;

			if (type === 'error') {
				console.error(data.message);
			} else if (type === 'message') {
				console.log('Received message:', data.message);
			}
		});

		ws.addEventListener('close', (event) => {
			console.log('WebSocket closed, reconnecting:', event.code, event.reason);
			rejoin();
		});
		ws.addEventListener('error', (event) => {
			console.log('WebSocket error, reconnecting:', event);
			rejoin();
		});
	}

	useEffect(() => {
		join();
		const handleBeforeUnload = () => {
			if (currentWebSocket) {
				currentWebSocket.close();
			}
		};
		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, []);

	return (
		<div className={styles.controller}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (currentWebSocket) {
						currentWebSocket.send(JSON.stringify({ type: 'next' }));
					} else {
						console.error('* Not connected to chat server.');
					}
				}}
			>
				<button>Next</button>
			</form>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (currentWebSocket) {
						currentWebSocket.send(JSON.stringify({ type: 'back' }));
					} else {
						console.error('* Not connected to chat server.');
					}
				}}
			>
				<button>Back</button>
			</form>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (currentWebSocket) {
						currentWebSocket.send(JSON.stringify({ type: 'reset' }));
					} else {
						console.error('* Not connected to chat server.');
					}
				}}
			>
				<button>Reset</button>
			</form>
		</div>
	);
}
