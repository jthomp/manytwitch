// PWA Installation and Update Management
let deferredPrompt;
let swRegistration;

document.addEventListener("DOMContentLoaded", init, false);

function init() {
	if ("serviceWorker" in navigator) {
		// Register service worker
		navigator.serviceWorker.register("/js/sw.js")
			.then((reg) => {
				console.log("Service worker registered", reg);
				swRegistration = reg;
				
				// Check for updates periodically
				setInterval(() => {
					reg.update();
				}, 60000); // Check every minute
				
				// Handle updates
				reg.addEventListener('updatefound', () => {
					const newWorker = reg.installing;
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							// New service worker available
							showUpdateNotification();
						}
					});
				});
			})
			.catch((err) => {
				console.error("Service worker registration failed:", err);
			});
			
		// Listen for controller change
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			window.location.reload();
		});
	}
	
	// Handle install prompt
	window.addEventListener('beforeinstallprompt', (e) => {
		// Prevent Chrome 67 and earlier from automatically showing the prompt
		e.preventDefault();
		// Stash the event so it can be triggered later
		deferredPrompt = e;
		// Show install button
		showInstallButton();
	});
	
	// Handle successful installation
	window.addEventListener('appinstalled', () => {
		console.log('PWA was installed');
		hideInstallButton();
		deferredPrompt = null;
	});
}

function showInstallButton() {
	// Check if install button already exists
	if (document.getElementById('pwa-install-button')) {
		return;
	}
	
	const installButton = document.createElement('button');
	installButton.id = 'pwa-install-button';
	installButton.innerHTML = '📥 Install App';
	installButton.style.cssText = `
		position: fixed;
		bottom: 20px;
		right: 20px;
		padding: 12px 20px;
		background-color: #9147ff;
		color: white;
		border: none;
		border-radius: 25px;
		cursor: pointer;
		font-size: 14px;
		font-weight: bold;
		box-shadow: 0 4px 6px rgba(0,0,0,0.3);
		z-index: 9999;
		transition: all 0.3s ease;
	`;
	
	installButton.addEventListener('mouseenter', () => {
		installButton.style.backgroundColor = '#772ce8';
		installButton.style.transform = 'scale(1.05)';
	});
	
	installButton.addEventListener('mouseleave', () => {
		installButton.style.backgroundColor = '#9147ff';
		installButton.style.transform = 'scale(1)';
	});
	
	installButton.addEventListener('click', async () => {
		if (deferredPrompt) {
			// Show the install prompt
			deferredPrompt.prompt();
			// Wait for the user to respond to the prompt
			const { outcome } = await deferredPrompt.userChoice;
			console.log(`User response to the install prompt: ${outcome}`);
			if (outcome === 'accepted') {
				hideInstallButton();
			}
			deferredPrompt = null;
		}
	});
	
	document.body.appendChild(installButton);
	
	// Auto-hide after 30 seconds if not clicked
	setTimeout(() => {
		if (document.getElementById('pwa-install-button')) {
			installButton.style.opacity = '0';
			setTimeout(() => {
				if (document.getElementById('pwa-install-button')) {
					installButton.remove();
				}
			}, 300);
		}
	}, 30000);
}

function hideInstallButton() {
	const button = document.getElementById('pwa-install-button');
	if (button) {
		button.style.opacity = '0';
		setTimeout(() => button.remove(), 300);
	}
}

function showUpdateNotification() {
	const notification = document.createElement('div');
	notification.id = 'pwa-update-notification';
	notification.style.cssText = `
		position: fixed;
		top: 20px;
		right: 20px;
		padding: 15px 20px;
		background-color: #2a2a2a;
		color: white;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0,0,0,0.3);
		z-index: 10000;
		max-width: 350px;
		animation: slideIn 0.3s ease;
	`;
	
	notification.innerHTML = `
		<div style="margin-bottom: 10px; font-weight: bold;">🔄 Update Available</div>
		<div style="margin-bottom: 15px; font-size: 14px; opacity: 0.9;">A new version of ManyTwitch is available.</div>
		<div style="display: flex; gap: 10px;">
			<button id="update-now" style="
				flex: 1;
				padding: 8px 15px;
				background-color: #9147ff;
				color: white;
				border: none;
				border-radius: 4px;
				cursor: pointer;
				font-weight: bold;
			">Update Now</button>
			<button id="update-later" style="
				flex: 1;
				padding: 8px 15px;
				background-color: transparent;
				color: white;
				border: 1px solid #555;
				border-radius: 4px;
				cursor: pointer;
			">Later</button>
		</div>
	`;
	
	// Add animation keyframes
	if (!document.getElementById('pwa-animations')) {
		const style = document.createElement('style');
		style.id = 'pwa-animations';
		style.textContent = `
			@keyframes slideIn {
				from {
					transform: translateX(400px);
					opacity: 0;
				}
				to {
					transform: translateX(0);
					opacity: 1;
				}
			}
		`;
		document.head.appendChild(style);
	}
	
	document.body.appendChild(notification);
	
	document.getElementById('update-now').addEventListener('click', () => {
		if (swRegistration && swRegistration.waiting) {
			swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
		}
		notification.remove();
	});
	
	document.getElementById('update-later').addEventListener('click', () => {
		notification.style.animation = 'slideIn 0.3s ease reverse';
		setTimeout(() => notification.remove(), 300);
	});
	
	// Auto-hide after 10 seconds
	setTimeout(() => {
		if (document.getElementById('pwa-update-notification')) {
			notification.style.animation = 'slideIn 0.3s ease reverse';
			setTimeout(() => {
				if (document.getElementById('pwa-update-notification')) {
					notification.remove();
				}
			}, 300);
		}
	}, 10000);
}
