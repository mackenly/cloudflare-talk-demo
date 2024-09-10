'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import styles from './screen.module.css';

const hostname = 'durable-presentation-server.mackenly.workers.dev';

export function ScreenView({ id, username = 'Anon' }: { id: string; username?: string | null | undefined }) {
	const [currentWebSocket, setCurrentWebSocket] = useState<WebSocket | null>(null);
	const [slideNumber, setSlideNumber] = useState<number>(1);
	const [nextSlideNumber, setNextSlideNumber] = useState<number>(2);
	const hasJoined = useRef(false);
	const [isPresentationMode, setIsPresentationMode] = useState(false);

	id = id
		.replace(/[^a-zA-Z0-9_-]/g, '')
		.replace(/_/g, '-')
		.toLowerCase();
	if (id.length > 32 && !id.match(/^[0-9a-f]{64}$/)) {
		throw new Error('Invalid screen ID');
	}

	function join() {
		if (hasJoined.current) return;
		hasJoined.current = true;

		const wss = document.location.protocol === 'http:' ? 'ws://' : 'wss://';
		let ws = new WebSocket(wss + hostname + '/api/room/' + id + '/websocket');
		let rejoined = false;
		let startTime = Date.now();

		let rejoin = async () => {
			if (!rejoined) {
				rejoined = true;
				setCurrentWebSocket(null);

				let timeSinceLastJoin = Date.now() - startTime;
				if (timeSinceLastJoin < 10000) {
					await new Promise((resolve) => setTimeout(resolve, 10000 - timeSinceLastJoin));
				}

				hasJoined.current = false;
				join();
			}
		};

		ws.addEventListener('open', (event) => {
			setCurrentWebSocket(ws);
			ws.send(JSON.stringify({ type: 'joined', name: username }));
		});

		ws.addEventListener('message', (event) => {
			let data;
			try {
				data = JSON.parse(event.data);
			} catch (error) {
				console.error('Error parsing message:', error);
				return;
			}

			console.log('Received data:', data);

			if (data.type === 'message' && typeof data.message === 'number') {
				setSlideNumber(data.message);
				setNextSlideNumber(data.message + 1);
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

    function handleKey(e: any) {
            if (e.key === 'ArrowRight') {
				console.log('Next slide');
				if (currentWebSocket) {
					currentWebSocket.send(JSON.stringify({ type: 'next' }));
				}
			} else if (e.key === 'ArrowLeft') {
				if (currentWebSocket) {
					currentWebSocket.send(JSON.stringify({ type: 'back' }));
				}
			}
        }

	const togglePresentationMode = async () => {
		if (!isPresentationMode) {
			try {
				// @ts-ignore
				await document.documentElement.requestFullscreen();
				if ('getScreenDetails' in window) {
					// @ts-ignore
					const screenDetails = await window.getScreenDetails();
					const screens = screenDetails.screens;
					if (screens.length > 1) {
						await screens[1].requestFullscreen();
					}
				}
                console.log('Entering presentation mode');
				setIsPresentationMode(true);
			} catch (err) {
				console.error('Error entering presentation mode:', err);
			}
		} else {
			try {
				await document.exitFullscreen();
				setIsPresentationMode(false);
			} catch (err) {
				console.error('Error exiting presentation mode:', err);
			}
		}
	};

	return (
		<div className="relative w-screen h-screen overflow-hidden">
			<Image
				src={`/slides/Slide${slideNumber+1}.JPG`}
				alt={`Slide ${slideNumber}`}
				width={2560}
				height={1440}
				objectFit="contain"
				priority
				className={styles.slide}
			/>
			<Image
				src={`/slides/Slide${nextSlideNumber+1}.JPG`}
				alt={`Slide ${nextSlideNumber}`}
				width={2560}
				height={1440}
				objectFit="contain"
				priority
				className={styles.nextSlide}
			/>
			<div className="absolute bottom-4 left-4 bg-white bg-opacity-50 p-2 rounded">Slide {slideNumber}</div>
			<button onClick={togglePresentationMode} className="absolute bottom-4 right-4 bg-blue-500 text-white p-2 rounded">
				{isPresentationMode ? 'Exit Presentation' : 'Present'}
			</button>
		</div>
	);
}
