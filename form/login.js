(function () {
	const scene = document.querySelector('.scene');
	requestAnimationFrame(() => {
		setTimeout(() => scene.classList.add('katana'), 60);
	});

	const form = document.getElementById('loginForm');
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const data = Object.fromEntries(new FormData(form).entries());

		const payload = {
			username: (data.username || '').trim(),
			fullName: (data.fullName || '').trim(),
			email: (data.email || '').trim(),
			password: data.password || ''
		};

		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const body = await res.json();
			if (!res.ok) {
				alert(body.error || 'Login failed');
				return;
			}
			localStorage.setItem('app.user', JSON.stringify(body));
			localStorage.setItem('app.isLoggedIn', 'true');
			window.location.href = '../home.html';
		} catch (err) {
			alert('Network error');
		}
	});

	// Provider sign-in
	async function authWith(provider, phone) {
		try {
			const res = await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ provider, phone: phone || null })
			});
			const body = await res.json();
			if (!res.ok) {
				alert(body.error || 'Authentication failed');
				return;
			}
			localStorage.setItem('app.user', JSON.stringify(body));
			localStorage.setItem('app.isLoggedIn', 'true');
			window.location.href = '../home.html';
		} catch (e) {
			alert('Network error');
		}
	}

	document.querySelectorAll('.provider').forEach(btn => {
		btn.addEventListener('click', () => authWith(btn.dataset.provider));
	});
	const phoneBtn = document.querySelector('.provider-phone');
	if (phoneBtn) {
		phoneBtn.addEventListener('click', () => {
			const phone = (new FormData(form).get('phone') || '').toString().trim();
			if (!phone) { alert('Enter phone number'); return; }
			authWith('phone', phone);
		});
	}
})();