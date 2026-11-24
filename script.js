document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- Mobile navigation ---- */
    const toggle = document.querySelector('.nav-toggle');
    const siteNav = document.getElementById('site-nav');

    if (toggle && siteNav) {
        const setOpen = (open) => {
            siteNav.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
        };

        toggle.addEventListener('click', () => {
            setOpen(toggle.getAttribute('aria-expanded') !== 'true');
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
                setOpen(false);
                toggle.focus();
            }
        });

        document.addEventListener('click', (event) => {
            if (!event.target.closest('.site-header')) {
                setOpen(false);
            }
        });

        siteNav.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                setOpen(false);
            }
        });
    }

    /* ---- Menu page: highlight the category in view ---- */
    const menuNav = document.querySelector('.menu-nav');
    const sections = document.querySelectorAll('.menu-section');

    if (menuNav && sections.length > 0) {
        const list = menuNav.querySelector('ul');
        const links = new Map();

        menuNav.querySelectorAll('a[href^="#"]').forEach((link) => {
            links.set(link.getAttribute('href').slice(1), link);
        });

        const setActive = (id) => {
            const active = links.get(id);
            if (!active || active.classList.contains('is-active')) {
                return;
            }

            links.forEach((link) => {
                link.classList.remove('is-active');
                link.removeAttribute('aria-current');
            });
            active.classList.add('is-active');
            active.setAttribute('aria-current', 'true');

            // Keep the active chip visible without moving the page itself
            const chip = active.getBoundingClientRect();
            const box = list.getBoundingClientRect();
            const target = list.scrollLeft + chip.left - box.left - (box.width - chip.width) / 2;
            list.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' });
        };

        // A tapped category stays highlighted while the page scrolls to it,
        // even when a short last section cannot reach the top of the screen.
        let lockedUntil = 0;

        links.forEach((link, id) => {
            link.addEventListener('click', () => {
                lockedUntil = Date.now() + 1200;
                setActive(id);
            });
        });

        const update = () => {
            if (Date.now() < lockedUntil) {
                return;
            }

            const offset = menuNav.getBoundingClientRect().bottom + 48;
            let current = sections[0].id;

            sections.forEach((section) => {
                if (section.getBoundingClientRect().top <= offset) {
                    current = section.id;
                }
            });

            const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
            if (atBottom) {
                current = sections[sections.length - 1].id;
            }

            setActive(current);
        };

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking) {
                return;
            }
            ticking = true;
            window.requestAnimationFrame(() => {
                update();
                ticking = false;
            });
        }, { passive: true });

        // The user taking over the scroll releases the lock straight away
        ['wheel', 'touchmove', 'keydown'].forEach((type) => {
            window.addEventListener(type, () => { lockedUntil = 0; }, { passive: true });
        });

        update();
    }

    /* ---- Gentle reveal on scroll ---- */
    const revealItems = document.querySelectorAll('.reveal');

    if (revealItems.length > 0) {
        if (reduceMotion || !('IntersectionObserver' in window)) {
            revealItems.forEach((item) => item.classList.add('is-in'));
        } else {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '0px 0px -8% 0px' });

            revealItems.forEach((item) => observer.observe(item));
        }
    }
});
