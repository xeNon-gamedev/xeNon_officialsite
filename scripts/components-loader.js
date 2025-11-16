const COMPONENT_MAP = {
	header: '/components/header.html',
	footer: '/components/footer.html'
};

document.addEventListener('DOMContentLoaded', async () => {
	const slots = Array.from(document.querySelectorAll('[data-component-slot]'));
	if (!slots.length) {
		initializeExistingComponents();
		return;
	}

	await Promise.all(slots.map(async (slot) => {
		const name = slot.dataset.componentSlot;
		const url = COMPONENT_MAP[name];
		if (!url) {
			return;
		}

		try {
			const response = await fetch(url, { credentials: 'same-origin' });
			if (!response.ok) {
				throw new Error(`Failed to load component: ${name}`);
			}

			const html = await response.text();
			const template = document.createElement('template');
			template.innerHTML = html.trim();
			const fragment = template.content.cloneNode(true);

			const inserted = fragment.firstElementChild;
			slot.replaceWith(fragment);

			if (name === 'header') {
				setupNavigation(inserted || document.querySelector('.site-header'));
			}
		} catch (error) {
			console.error(error);
		}
	}));

	initializeExistingComponents();
});

function initializeExistingComponents() {
	const header = document.querySelector('[data-component="header"]');
	if (header) {
		setupNavigation(header);
	}
}

function setupNavigation(header) {
	if (!header) {
		return;
	}

	if (header.dataset.navReady === 'true') {
		return;
	}

	header.dataset.navReady = 'true';

	const toggle = header.querySelector('[data-toggle="nav"]');
	const nav = header.querySelector('.site-nav');
	const navLinks = nav ? nav.querySelectorAll('a') : [];

	highlightActiveLink(navLinks);

	if (!toggle || !nav) {
		return;
	}

	const closeNav = () => {
		header.classList.remove('is-menu-open');
		toggle.setAttribute('aria-expanded', 'false');
	};

	const openNav = () => {
		header.classList.add('is-menu-open');
		toggle.setAttribute('aria-expanded', 'true');
	};

	toggle.addEventListener('click', () => {
		const isOpen = header.classList.contains('is-menu-open');
		if (isOpen) {
			closeNav();
		} else {
			openNav();
		}
	});

	navLinks.forEach((link) => {
		link.addEventListener('click', () => {
			closeNav();
		});
	});

	const handleResize = () => {
		if (window.innerWidth >= 960) {
			closeNav();
		}
	};

	const handleKeydown = (event) => {
		if (event.key === 'Escape') {
			closeNav();
		}
	};

	window.addEventListener('resize', handleResize);
	document.addEventListener('keydown', handleKeydown);

	header.addEventListener('component:teardown', () => {
		window.removeEventListener('resize', handleResize);
		document.removeEventListener('keydown', handleKeydown);
	}, { once: true });
}

function highlightActiveLink(links) {
	if (!links || !links.length) {
		return;
	}

	const currentUrl = new URL(window.location.href);
	const currentPath = normalizePath(currentUrl.pathname);

	links.forEach((link) => {
		const linkUrl = new URL(link.href, currentUrl.origin);
		if (linkUrl.origin !== currentUrl.origin) {
			return;
		}

		const linkPath = normalizePath(linkUrl.pathname);
		if (currentPath === linkPath || (linkPath !== '/' && currentPath.startsWith(linkPath))) {
			link.setAttribute('aria-current', 'page');
		}
	});
}

function normalizePath(pathname) {
	return pathname
		.replace(/index\.html$/i, '')
		.replace(/\/$/, '')
		|| '/';
}
