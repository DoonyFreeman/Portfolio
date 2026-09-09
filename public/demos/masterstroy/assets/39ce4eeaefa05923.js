
; /* Start:"a:4:{s:4:"full";s:54:"/local/templates/masterstroy/script.js?178670439411872";s:6:"source";s:38:"/local/templates/masterstroy/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* script.js — общий JS шаблона (инициализация меню, модалок и т.п.) */
(function () {
    'use strict';

    /**
     * Неактивная стрелка на краю ленты — 40% по компонент-сетам 0:1187 (ПК) и 0:1982 (МБ):
     * приглушение вшито в группу «назад», а счётчик на макете стоит на 01/06, то есть
     * лента в начале и идти назад некуда. Само приглушение делает CSS по :disabled,
     * здесь только выставляется само состояние (issue #223).
     *
     * Помощник живёт в script.js: он подключается первым (header.php), поэтому доступен
     * остальным файлам как window.msArrowEdges. Прежде эта логика существовала в одной
     * копии — в construction.js; теперь ею пользуются все прокручиваемые слайдеры.
     */
    var trackScrollEdges = function (viewport, previous, next) {
        if (!viewport) return;

        /**
         * Допуск на краях. Нужен по двум причинам:
         *  - браузеры отдают дробный scrollLeft при масштабировании страницы;
         *  - scroll-snap прижимает первую карточку к её краю, а не к нулю: у слайдера
         *    «проекты» трек имеет padding-left 13px, и в начале ленты scrollLeft равен 13.
         *    С допуском 1px кнопка «назад» там оставалась активной на первой карточке.
         * 16px заведомо меньше любой карточки, поэтому реальную смену слайда допуск
         * замаскировать не может.
         */
        var EDGE_TOLERANCE = 16;

        var update = function () {
            var hasOverflow = viewport.scrollWidth > viewport.clientWidth + EDGE_TOLERANCE;
            if (previous) previous.disabled = !hasOverflow || viewport.scrollLeft <= EDGE_TOLERANCE;
            // Листать нечего — «вперёд» тоже неактивна. Прежняя версия этой проверки
            // (единственная копия, в construction.js) при отсутствии переполнения
            // оставляла кнопку живой: она кликалась, но ничего не делала. На детальной ЖК
            // так вели себя секции «Жизнь в…» и «Ход строительства» на 1920, где карточки
            // укладываются без прокрутки.
            if (next) next.disabled = !hasOverflow || viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - EDGE_TOLERANCE;
        };

        viewport.addEventListener('scroll', update, { passive: true });
        // Ресайз меняет и clientWidth, и раскладку карточек — состояние краёв уезжает.
        window.addEventListener('resize', update);
        update();
        return update;
    };

    /**
     * То же для слайдеров, которые считают индекс, а не прокручивают: край — это
     * первый и последний слайд.
     */
    var trackIndexEdges = function (previous, next, index, total) {
        if (previous) previous.disabled = index <= 0;
        if (next) next.disabled = index >= total - 1;
    };

    /**
     * Форма существительного при числе — парная копия ms_content_plural() из
     * lib/estate-content.php (issue #248). Подпись рисует сервер, а пересчитывает клиент:
     * «Показать ещё N …» и «Смотреть N …» меняются на каждом шаге и при каждом фильтре,
     * поэтому одной серверной функции мало.
     *
     * Слово, а не готовая фраза: падеж зависит от места — «Смотреть 1 квартиру»
     * винительный, «1 квартира» на маркере карты именительный. Выбирает вызывающий.
     *
     * Что обе реализации дают одно и то же, сверяет tests/plural-agreement.php.
     */
    function msPlural(count, one, few, many) {
        var absolute = Math.abs(count);
        var lastTwo = absolute % 100;
        var last = absolute % 10;

        // 11–14 идут раньше проверки последней цифры: «11 квартир», а не «11 квартира».
        if (lastTwo >= 11 && lastTwo <= 14) return many;
        if (last === 1) return one;
        if (last >= 2 && last <= 4) return few;
        return many;
    }

    /**
     * Единые правила фильтра для главной и /apartments/. Обе формы получают один и тот
     * же ms_catalog_index(), поэтому проект, комнаты, диапазоны и очередь обязаны давать
     * одинаковое число до и после перехода на страницу каталога.
     */
    function msFilterApartmentIndex(index, criteria) {
        return index.filter(function (item) {
            var matchesProject = !criteria.project || item.project === criteria.project;
            var matchesRooms = !criteria.rooms.length || criteria.rooms.indexOf(item.rooms) !== -1;
            var hasFloor = item.floor !== null && item.floor !== '' && typeof item.floor !== 'undefined';
            var floor = hasFloor ? Number(item.floor) : Number.NaN;
            var floorIsActive = criteria.floorFrom > 0 || Number.isFinite(criteria.floorTo);
            var matchesFloor = !floorIsActive || (Number.isFinite(floor) && floor >= criteria.floorFrom && floor <= criteria.floorTo);
            var matchesPrice = item.price >= criteria.priceFrom && item.price <= criteria.priceTo;
            var matchesArea = item.area >= criteria.areaFrom && item.area <= criteria.areaTo;
            var matchesQueue = !criteria.queue || item.queue === criteria.queue;
            var matchesDeadline = !criteria.deadline || (criteria.deadline === 'ready'
                ? item.deadline === 'ready'
                : item.deadline === 'ready' || Number(item.deadline) <= Number(criteria.deadline));
            return matchesProject && matchesRooms && matchesFloor && matchesPrice && matchesArea && matchesQueue && matchesDeadline;
        });
    }

    window.msArrowEdges = trackScrollEdges;
    window.msArrowEdgesByIndex = trackIndexEdges;
    window.msPlural = msPlural;
    window.msFilterApartmentIndex = msFilterApartmentIndex;

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.about-residents').forEach(function (section) {
            var track = section.querySelector('[data-about-residents-track]');
            var cards = track ? track.querySelectorAll('article') : [];
            var previous = section.querySelector('[data-about-residents-prev]');
            var next = section.querySelector('[data-about-residents-next]');
            if (!track || !cards.length || !previous || !next) return;

            var disclosureFrame = 0;
            var syncDisclosureHeights = function () {
                cancelAnimationFrame(disclosureFrame);
                disclosureFrame = requestAnimationFrame(function () {
                    cards.forEach(function (card) {
                        var copy = card.querySelector('p');
                        if (copy) card.style.setProperty('--residents-copy-height', copy.scrollHeight + 'px');
                    });
                });
            };

            var step = function () {
                var gap = parseFloat(getComputedStyle(track).gap) || 0;
                return cards[0].getBoundingClientRect().width + gap;
            };
            previous.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
            next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
            trackScrollEdges(track, previous, next);
            syncDisclosureHeights();
            window.addEventListener('resize', syncDisclosureHeights, { passive: true });
            if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncDisclosureHeights);
        });

        document.querySelectorAll('.about-principles').forEach(function (section) {
            var track = section.querySelector('[data-about-principles-track]');
            var cards = track ? track.querySelectorAll('article') : [];
            var previous = section.querySelector('[data-about-principles-prev]');
            var next = section.querySelector('[data-about-principles-next]');
            if (!track || !cards.length || !previous || !next) return;

            var step = function () {
                var gap = parseFloat(getComputedStyle(track).gap) || 0;
                return cards[0].getBoundingClientRect().width + gap;
            };
            previous.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
            next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
            trackScrollEdges(track, previous, next);
        });

        document.querySelectorAll('.about-news').forEach(function (section) {
            var track = section.querySelector('[data-about-news-track]');
            var cards = track ? track.querySelectorAll('a') : [];
            var previous = section.querySelector('[data-about-news-prev]');
            var next = section.querySelector('[data-about-news-next]');
            if (!track || !cards.length || !previous || !next) return;

            var step = function () {
                var gap = parseFloat(getComputedStyle(track).gap) || 0;
                return cards[0].getBoundingClientRect().width + gap;
            };
            previous.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
            next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
            trackScrollEdges(track, previous, next);
        });

        document.querySelectorAll('.about-feedback').forEach(function (section) {
            var viewport = section.querySelector('.about-feedback__viewport');
            var cards = section.querySelectorAll('.about-feedback article');
            var previous = section.querySelector('[data-about-feedback-prev]');
            var next = section.querySelector('[data-about-feedback-next]');
            if (!viewport || !cards.length || !previous || !next) return;

            var step = function () {
                var cardWidth = cards[0].getBoundingClientRect().width;
                var gap = parseFloat(getComputedStyle(section.querySelector('.about-feedback__track')).gap) || 0;
                return cardWidth + gap;
            };
            previous.addEventListener('click', function () { viewport.scrollBy({ left: -step(), behavior: 'smooth' }); });
            next.addEventListener('click', function () { viewport.scrollBy({ left: step(), behavior: 'smooth' }); });
            trackScrollEdges(viewport, previous, next);
        });
    });
})();

/* End */
;
; /* Start:"a:4:{s:4:"full";s:71:"/local/templates/masterstroy/assets/js/cookie-consent.js?17879152893281";s:6:"source";s:56:"/local/templates/masterstroy/assets/js/cookie-consent.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function () {
    'use strict';

    var CONSENT_ENDPOINT = '/local/ajax/cookie-consent.php';

    function activateMarketingScripts(root) {
        if (root.dataset.marketingActivated === 'true') return;
        root.dataset.marketingActivated = 'true';

        root.querySelectorAll('script[type="text/plain"][data-cookie-consent-script="marketing"]').forEach(function (source) {
            var script = document.createElement('script');
            Array.prototype.forEach.call(source.attributes, function (attribute) {
                if (attribute.name !== 'type' && attribute.name !== 'data-cookie-consent-script') {
                    script.setAttribute(attribute.name, attribute.value);
                }
            });
            script.text = source.textContent;
            source.parentNode.insertBefore(script, source.nextSibling);
            source.remove();
        });

        window.dispatchEvent(new CustomEvent('masterstroy:marketing-consent', {
            detail: {accepted: true}
        }));
    }

    function requestId() {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
            return window.crypto.randomUUID();
        }
        return String(Date.now()) + '-' + Math.random().toString(16).slice(2);
    }

    function init() {
        var root = document.querySelector('[data-cookie-consent-root]');
        if (!root) return;

        if (root.dataset.consentState === 'accepted') {
            activateMarketingScripts(root);
            return;
        }

        var banner = root.querySelector('[data-cookie-consent-banner]');
        var button = root.querySelector('[data-cookie-consent-accept]');
        var status = root.querySelector('[data-cookie-consent-status]');
        if (!banner || !button) return;

        button.addEventListener('click', function () {
            button.disabled = true;
            if (status) status.textContent = 'Сохраняем согласие…';

            var body = new FormData();
            body.append('sessid', root.dataset.sessid || '');
            body.append('request_id', requestId());
            body.append('page', window.location.pathname);

            window.fetch(CONSENT_ENDPOINT, {
                method: 'POST',
                body: body,
                credentials: 'same-origin',
                headers: {'X-Requested-With': 'XMLHttpRequest'}
            }).then(function (response) {
                return response.json().then(function (payload) {
                    if (!response.ok || !payload.ok) throw new Error(payload.error || 'save_failed');
                    return payload;
                });
            }).then(function () {
                root.dataset.consentState = 'accepted';
                activateMarketingScripts(root);
                banner.remove();
            }).catch(function () {
                button.disabled = false;
                if (status) status.textContent = 'Не удалось сохранить согласие. Проверьте соединение и попробуйте ещё раз.';
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

/* End */
;
; /* Start:"a:4:{s:4:"full";s:66:"/local/templates/masterstroy/assets/js/favorites.js?17867043926118";s:6:"source";s:51:"/local/templates/masterstroy/assets/js/favorites.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function () {
    'use strict';

    var KEY = 'ms-favorites';

    function read() {
        try {
            var list = JSON.parse(window.localStorage.getItem(KEY));
            return Array.isArray(list) ? list.filter(function (item, index) {
                return typeof item === 'string' && item !== '' && list.indexOf(item) === index;
            }) : [];
        } catch (error) {
            return [];
        }
    }

    function write(list) {
        try {
            window.localStorage.setItem(KEY, JSON.stringify(list));
        } catch (error) {
            // Приватный режим — работаем без сохранения между визитами.
        }
        render();
        document.dispatchEvent(new CustomEvent('ms-favorites-change', { detail: { items: list.slice() } }));
    }

    function render() {
        var count = read().length;
        document.querySelectorAll('[data-favorites-count]').forEach(function (badge) {
            badge.textContent = count > 0 ? String(count) : '';
            badge.hidden = count === 0;
        });
        document.querySelectorAll('[data-favorites-link]').forEach(function (link) {
            link.setAttribute('aria-label', count > 0 ? 'Избранное, объектов: ' + count : 'Избранное');
        });
    }

    window.msFavorites = {
        has: function (id) {
            return read().indexOf(id) !== -1;
        },
        all: function () {
            return read().slice();
        },
        remove: function (id) {
            var list = read().filter(function (item) { return item !== id; });
            write(list);
            return list;
        },
        replace: function (list) {
            write(Array.isArray(list) ? list : []);
        },
        toggle: function (id) {
            var list = read();
            var index = list.indexOf(id);
            if (index === -1) {
                list.push(id);
            } else {
                list.splice(index, 1);
            }
            write(list);
            return index === -1;
        }
    };

    function initPage() {
        var page = document.querySelector('[data-favorites-page]');
        if (!page) return;
        var results = page.querySelector('[data-favorites-results]');
        var status = page.querySelector('[data-favorites-status]');

        function showEmpty(text) {
            results.innerHTML = '';
            status.textContent = text || 'В избранном пока нет квартир.';
            status.hidden = false;
        }

        function load() {
            var keys = window.msFavorites.all();
            if (!keys.length) {
                showEmpty('В избранном пока нет квартир.');
                return;
            }
            status.textContent = 'Загружаем сохранённые квартиры…';
            status.hidden = false;
            var ids = keys.map(function (key) { return key.split(':').pop(); }).filter(function (id) { return /^\d+$/.test(id); });
            if (!ids.length) {
                window.msFavorites.replace([]);
                showEmpty('Сохранённые квартиры больше не доступны.');
                return;
            }
            var batches = [];
            for (var offset = 0; offset < ids.length; offset += 12) batches.push(ids.slice(offset, offset + 12));
            Promise.all(batches.map(function (batch) {
                return fetch('/local/ajax/apartments.php?ids=' + encodeURIComponent(batch.join(',')), { credentials: 'same-origin' })
                    .then(function (response) {
                        if (!response.ok) throw new Error('http_' + response.status);
                        return response.text();
                    });
            }))
                .then(function (htmlParts) {
                    results.innerHTML = htmlParts.join('');
                    Array.prototype.slice.call(results.querySelectorAll('[data-favorite-key]')).forEach(function (card) {
                        if (keys.indexOf(card.dataset.favoriteKey) === -1) card.remove();
                    });
                    var cards = Array.prototype.slice.call(results.querySelectorAll('[data-favorite-key]'));
                    var returned = cards.map(function (card) { return card.dataset.favoriteKey; }).filter(function (key) { return keys.indexOf(key) !== -1; });
                    if (returned.length !== keys.length) window.msFavorites.replace(returned);
                    cards.forEach(function (card) {
                        var remove = document.createElement('button');
                        remove.className = 'favorites-page__remove';
                        remove.type = 'button';
                        remove.setAttribute('aria-label', 'Удалить квартиру из избранного');
                        remove.textContent = 'Удалить';
                        remove.addEventListener('click', function () {
                            window.msFavorites.remove(card.dataset.favoriteKey);
                            card.remove();
                            if (!results.querySelector('[data-favorite-key]')) showEmpty('В избранном пока нет квартир.');
                        });
                        card.appendChild(remove);
                    });
                    status.hidden = cards.length > 0;
                    if (!cards.length) showEmpty('Сохранённые квартиры больше не доступны.');
                })
                .catch(function () { showEmpty('Не удалось загрузить избранное. Обновите страницу позже.'); });
        }
        load();
    }

    // Бандл Bitrix подключается в <head> — ждём разметку перед первым рендером
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { render(); initPage(); });
    else { render(); initPage(); }
})();

/* End */
;
; /* Start:"a:4:{s:4:"full";s:63:"/local/templates/masterstroy/assets/js/header.js?17867043929444";s:6:"source";s:48:"/local/templates/masterstroy/assets/js/header.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* Responsive header, dropdown navigation and mobile menu. */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var header = document.querySelector('[data-site-header]');
        if (!header) return;

        var overlay = header.querySelector('[data-header-overlay]');
        var toggleButtons = Array.prototype.slice.call(header.querySelectorAll('[data-header-toggle]'));
        var navButtons = Array.prototype.slice.call(header.querySelectorAll('[data-header-open]'));
        var desktopViews = Array.prototype.slice.call(header.querySelectorAll('[data-header-view]'));
        var mobileViews = Array.prototype.slice.call(header.querySelectorAll('[data-mobile-view]'));
        var lastTrigger = null;
        var isDesktop = window.matchMedia('(min-width: 1024px)');

        function activate(items, attribute, value) {
            items.forEach(function (item) {
                item.classList.toggle('is-active', item.getAttribute(attribute) === value);
            });
        }

        function visibleFocusable(container) {
            return Array.prototype.slice.call(container.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(function (item) {
                return item.getClientRects().length > 0;
            });
        }

        function focusAfterRender(element) {
            window.requestAnimationFrame(function () {
                if (element && typeof element.focus === 'function') element.focus();
            });
        }

        function restoreDesktopScroll(x, y) {
            if (!isDesktop.matches) return;

            /* Showing an absolutely positioned drawer inside a sticky header can
               trigger browser scroll anchoring. Restore the exact position after
               both the synchronous layout and the following animation frame. */
            header.getBoundingClientRect();
            window.scrollTo(x, y);
            window.requestAnimationFrame(function () { window.scrollTo(x, y); });
        }

        function setMobileView(value, moveFocus) {
            var nextValue = value || 'root';
            activate(mobileViews, 'data-mobile-view', nextValue);
            if (overlay) overlay.scrollTop = 0;
            if (moveFocus && !isDesktop.matches) {
                var activeView = header.querySelector('[data-mobile-view="' + nextValue + '"]');
                focusAfterRender(nextValue === 'root' ? activeView.querySelector('button, a[href]') : activeView.querySelector('[data-mobile-back]'));
            }
        }

        function openMenu(view, trigger) {
            var scrollX = window.scrollX;
            var scrollY = window.scrollY;
            lastTrigger = trigger || document.activeElement;
            overlay.setAttribute('data-header-active-view', view || 'drawer');
            overlay.hidden = false;
            overlay.setAttribute('aria-hidden', 'false');
            header.classList.add('is-open');
            document.documentElement.classList.add('is-menu-open');
            toggleButtons.forEach(function (button) { button.setAttribute('aria-expanded', 'true'); });
            toggleButtons.forEach(function (button) {
                var label = button.querySelector('.visually-hidden');
                if (label) label.textContent = 'Закрыть меню';
            });
            navButtons.forEach(function (button) {
                var active = button.getAttribute('data-header-open') === view;
                button.classList.toggle('is-active', active);
                button.setAttribute('aria-expanded', active ? 'true' : 'false');
            });
            activate(desktopViews, 'data-header-view', view || 'drawer');
            if ((view || 'drawer') === 'drawer') {
                var drawer = header.querySelector('[data-header-view="drawer"]');
                var drawerDefault = drawer ? drawer.getAttribute('data-drawer-default') : 'drawer-purchase';
                header.querySelectorAll('[data-drawer-tab]').forEach(function (tab) {
                    var active = tab.getAttribute('data-drawer-tab') === drawerDefault;
                    tab.classList.toggle('is-active', active);
                    tab.setAttribute('aria-selected', active ? 'true' : 'false');
                });
                header.querySelectorAll('[data-drawer-pane]').forEach(function (pane) {
                    var active = pane.getAttribute('data-drawer-pane') === drawerDefault;
                    pane.classList.toggle('is-active', active);
                    pane.setAttribute('aria-hidden', active ? 'false' : 'true');
                });
            }
            setMobileView('root', false);
            if (!isDesktop.matches) focusAfterRender(header.querySelector('[data-header-close]'));
            restoreDesktopScroll(scrollX, scrollY);
        }

        function closeMenu(restoreFocus) {
            var scrollX = window.scrollX;
            var scrollY = window.scrollY;
            overlay.hidden = true;
            overlay.setAttribute('aria-hidden', 'true');
            header.classList.remove('is-open');
            document.documentElement.classList.remove('is-menu-open');
            toggleButtons.concat(navButtons).forEach(function (button) {
                button.classList.remove('is-active');
                button.setAttribute('aria-expanded', 'false');
            });
            toggleButtons.forEach(function (button) {
                var label = button.querySelector('.visually-hidden');
                if (label) label.textContent = 'Открыть меню';
            });
            desktopViews.forEach(function (view) { view.classList.remove('is-active'); });
            setMobileView('root', false);
            if (restoreFocus && lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
            lastTrigger = null;
            restoreDesktopScroll(scrollX, scrollY);
        }

        toggleButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                if (header.classList.contains('is-open')) closeMenu(true);
                else openMenu('drawer', button);
            });
        });

        navButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                var view = button.getAttribute('data-header-open');
                if (header.classList.contains('is-open') && button.classList.contains('is-active')) closeMenu(true);
                else openMenu(view, button);
            });
        });

        header.querySelectorAll('[data-header-close]').forEach(function (button) {
            button.addEventListener('click', function () { closeMenu(true); });
        });

        header.querySelectorAll('[data-mobile-open]').forEach(function (button) {
            button.addEventListener('click', function () { setMobileView(button.getAttribute('data-mobile-open'), true); });
        });

        header.querySelectorAll('[data-mobile-back]').forEach(function (button) {
            button.addEventListener('click', function () { setMobileView('root', true); });
        });

        header.querySelectorAll('[data-drawer-tab]').forEach(function (button) {
            button.addEventListener('click', function () {
                var pane = button.getAttribute('data-drawer-tab');
                header.querySelectorAll('[data-drawer-tab]').forEach(function (tab) {
                    var active = tab === button;
                    tab.classList.toggle('is-active', active);
                    tab.setAttribute('aria-selected', active ? 'true' : 'false');
                });
                header.querySelectorAll('[data-drawer-pane]').forEach(function (item) {
                    var active = item.getAttribute('data-drawer-pane') === pane;
                    item.classList.toggle('is-active', active);
                    item.setAttribute('aria-hidden', active ? 'false' : 'true');
                });
            });
        });

        overlay.addEventListener('click', function (event) {
            if (event.target.closest('a') && !event.target.closest('[target="_blank"]')) closeMenu(false);
        });

        document.addEventListener('keydown', function (event) {
            if (!header.classList.contains('is-open')) return;
            if (event.key === 'Escape') {
                closeMenu(true);
                return;
            }
            if (event.key === 'Tab' && !isDesktop.matches) {
                var focusable = visibleFocusable(overlay);
                if (!focusable.length) return;
                var first = focusable[0];
                var last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                } else if (!overlay.contains(document.activeElement)) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });

        if (typeof isDesktop.addEventListener === 'function') {
            isDesktop.addEventListener('change', function () { closeMenu(false); });
        }
    });
})();

/* End */
;
; /* Start:"a:4:{s:4:"full";s:70:"/local/templates/masterstroy/assets/js/gallery-swipe.js?17867043929123";s:6:"source";s:55:"/local/templates/masterstroy/assets/js/gallery-swipe.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function () {
    'use strict';

    /**
     * Лента снимков, которая едет за пальцем. Общая механика для двух галерей: виды
     * планировки в карточке каталога и они же во вкладке «Планировка» на детальной.
     *
     * Раньше вид переключался мгновенной сменой `hidden`, и на телефоне это ощущалось
     * дёшево: палец ведёт, а картинка скачет. Теперь снимки лежат в ряд, лента смещается
     * трансформацией и во время касания следует за пальцем, а на отпускании доезжает до
     * ближайшего кадра.
     *
     * Кто листает — не важно: точки, зоны наведения и свайп зовут одну и ту же msGalleryShow(),
     * а подсветку точек рисуют обработчики события `ms-slide`. Иначе три способа управления
     * разъехались бы по состоянию.
     *
     * Обработчики делегированы на документе: каталог догружает карточки AJAX-ом, и
     * навешенное при загрузке страницы до них бы не добралось.
     */

    // Короче 40px — это дрожание пальца при нажатии, а не листание.
    var SWIPE = 40;
    // Пока смещение меньше 8px, направление жеста ещё не ясно: не перехватываем.
    var LOCK = 8;

    /**
     * Лента, к которой относится касание. Ищем от корня галереи, а не по самой ленте:
     * карточку каталога целиком кроет ссылка-подложка, и палец попадает в НЕЁ. Проверка
     * `closest('[data-gallery-track]')` возвращала null, и свайп по карточкам на телефоне
     * не работал вовсе — а синтетические события в тестах били прямо в ленту и этого не
     * показывали.
     */
    function trackAt(node) {
        var root = node && node.closest ? node.closest('[data-gallery]') : null;
        return root ? root.querySelector('[data-gallery-track]') : null;
    }

    function slides(track) {
        return track.children.length;
    }

    function current(track) {
        return Number(track.dataset.slide || 0);
    }

    function offset(track, index, shift) {
        track.style.transform = 'translate3d(calc(' + (-index * 100) + '% + ' + shift + 'px), 0, 0)';
    }

    /**
     * Показать кадр. Выход за края — ничего: по кругу лента не ходит, а незаметно
     * перепрыгнуть с последнего вида на первый хуже, чем упереться.
     */
    window.msGalleryShow = function (track, index) {
        if (!track || index < 0 || index >= slides(track)) {
            return;
        }
        track.dataset.slide = String(index);
        offset(track, index, 0);
        track.dispatchEvent(new CustomEvent('ms-slide', { bubbles: true, detail: { index: index } }));
    };

    /**
     * Колесо и трекпад на ПК: листаем ТОЛЬКО горизонтальным жестом. На MacBook это
     * привычный сдвиг двумя пальцами вбок, на мыши — Shift+колесо, а обычная вертикальная
     * прокрутка остаётся прокруткой страницы. Перехватывать её нельзя: страница длинная, и
     * галерея, съедающая скролл, — известный способ разозлить посетителя.
     */
    // Накопленный сдвиг, после которого жест засчитан. Больше пальцевого порога: на
    // трекпаде «чуть-чуть двумя пальцами» — это десятки пикселей, и раньше такой мазок
    // мгновенно перекидывал кадр.
    var WHEEL = 60;
    // Тишина, после которой жест считается законченным (инерция трекпада шлёт события пачкой).
    var WHEEL_IDLE = 110;
    var wheel = null;

    function wheelEnd() {
        if (!wheel) {
            return;
        }
        var track = wheel.track;
        var accum = wheel.accum;
        clearTimeout(wheel.timer);
        wheel = null;
        track.classList.remove('is-dragging');
        var passed = Math.abs(accum) >= WHEEL;
        window.msGalleryShow(track, current(track) + (passed ? (accum > 0 ? 1 : -1) : 0));
        if (passed) {
            track.dispatchEvent(new CustomEvent('ms-slide-drag', { bubbles: true, detail: { source: 'wheel' } }));
        }
    }

    document.addEventListener('wheel', function (event) {
        var track = trackAt(event.target);
        if (!track || slides(track) < 2 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
            return;
        }
        event.preventDefault();

        if (wheel && wheel.track !== track) {
            wheelEnd();
        }
        if (!wheel) {
            wheel = { track: track, accum: 0, timer: 0 };
            track.classList.add('is-dragging');
        }
        clearTimeout(wheel.timer);

        // Лента идёт за пальцами так же, как на телефоне за пальцем, и доезжает на
        // отпускании. Дальше соседнего кадра не уходит: инерция трекпада после отрыва
        // шлёт ещё сотни пикселей, и без ограничения на экране мелькал бы третий кадр.
        var width = track.getBoundingClientRect().width || 1;
        wheel.accum = Math.max(-width, Math.min(width, wheel.accum + event.deltaX));

        var index = current(track);
        var shift = -wheel.accum;
        // У краёв лента тянется втрое туже — то же правило, что у пальца.
        if ((index === 0 && shift > 0) || (index === slides(track) - 1 && shift < 0)) {
            shift /= 3;
        }
        offset(track, index, shift);
        wheel.timer = setTimeout(wheelEnd, WHEEL_IDLE);
    }, { passive: false });

    var drag = null;

    document.addEventListener('touchstart', function (event) {
        var track = trackAt(event.target);
        if (!track || event.touches.length !== 1 || slides(track) < 2) {
            drag = null;
            return;
        }
        drag = { track: track, x: event.touches[0].clientX, y: event.touches[0].clientY, dx: 0, axis: '' };
        // Снимаем плавность на время касания: лента должна идти ровно за пальцем.
        track.classList.add('is-dragging');
    }, { passive: true });

    document.addEventListener('touchmove', function (event) {
        if (!drag) {
            return;
        }
        var dx = event.touches[0].clientX - drag.x;
        var dy = event.touches[0].clientY - drag.y;
        if (!drag.axis) {
            if (Math.abs(dx) < LOCK && Math.abs(dy) < LOCK) {
                return;
            }
            // Вертикальный жест — это прокрутка страницы, ленту он не трогает.
            drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        }
        if (drag.axis !== 'x') {
            return;
        }

        var index = current(drag.track);
        // У краёв лента тянется втрое туже: палец чувствует, что дальше некуда.
        if ((index === 0 && dx > 0) || (index === slides(drag.track) - 1 && dx < 0)) {
            dx /= 3;
        }
        drag.dx = dx;
        offset(drag.track, index, dx);
    }, { passive: true });

    document.addEventListener('touchend', function () {
        if (!drag) {
            return;
        }
        var track = drag.track;
        var dx = drag.dx;
        var swiped = drag.axis === 'x' && Math.abs(dx) >= SWIPE;
        drag = null;
        track.classList.remove('is-dragging');

        // Недотянутый жест возвращает ленту на место — тем же плавным движением.
        window.msGalleryShow(track, current(track) + (swiped ? (dx < 0 ? 1 : -1) : 0));
        if (swiped) {
            track.dispatchEvent(new CustomEvent('ms-slide-drag', { bubbles: true, detail: { source: 'touch' } }));
        }
    }, { passive: true });
}());

/* End */
;
; /* Start:"a:4:{s:4:"full";s:71:"/local/templates/masterstroy/assets/js/apartment-card.js?17867043926561";s:6:"source";s:56:"/local/templates/masterstroy/assets/js/apartment-card.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function () {
    'use strict';

    /**
     * Виды планировки в карточке каталога: планировка, планировка с мебелью,
     * 3D-визуализацию. Адреса кладёт в разметку сервер, скрипт только выбирает кадр.
     *
     * Способов выбрать три — точка, зона наведения и свайп, — но состояние одно: лента
     * (gallery-swipe.js). Здесь остаются только ввод и подсветка точек, а само движение и
     * касания живут там: иначе три способа управления разъехались бы по состоянию.
     *
     * Делегирование на документе, а не инициализация каждой карточки: каталог догружает
     * карточки AJAX-ом, а на страницах ЖК часть сетки скрыта до «Показать ещё». Обработчик,
     * повешенный при загрузке страницы, до этих карточек бы не добрался.
     */

    // Курсора может не быть вовсе: на тач-экране браузер шлёт «наведение» синтетически,
    // прямо перед нажатием, и без этой проверки палец дёргал бы вид на пути к переходу.
    var HOVER = window.matchMedia('(hover: hover)');

    function cardOf(node) {
        return node && node.closest ? node.closest('.apartment-card') : null;
    }

    function trackOf(card) {
        return card ? card.querySelector('.apartment-card__track') : null;
    }

    function dotsOf(card) {
        return card ? card.querySelectorAll('.apartment-card__dots button') : [];
    }

    function show(card, index) {
        window.msGalleryShow(trackOf(card), index);
    }

    // Подсветку точек рисуем по событию ленты: кто её сдвинул — точка, курсор или палец —
    // здесь уже не важно.
    document.addEventListener('ms-slide', function (event) {
        var dots = dotsOf(cardOf(event.target));
        for (var i = 0; i < dots.length; i++) {
            dots[i].setAttribute('aria-current', i === event.detail.index ? 'true' : 'false');
        }
    });

    /**
     * Осознанный выбор — нажатие на точку, свайп или жест трекпада — закрепляет вид за
     * карточкой: наведение его больше не трогает и уход курсора не сбрасывает.
     *
     * Без этого способы управления дрались: пролистал колесом на второй вид, шевельнул
     * мышью на пару пикселей — и карточка отскочила на первый, потому что курсор стоит в
     * первой трети. Наведение — это быстрый просмотр, а выбор есть выбор.
     */
    function lock(card) {
        if (card) {
            card.dataset.galleryChosen = '1';
        }
    }

    document.addEventListener('click', function (event) {
        var dot = event.target && event.target.closest ? event.target.closest('.apartment-card__dots button') : null;
        if (!dot) {
            return;
        }
        var card = cardOf(dot);
        lock(card);
        show(card, Array.prototype.indexOf.call(dot.parentNode.children, dot));
    });

    // Свайп и жест трекпада ведёт общая лента — она же сообщает, что жест был осознанным.
    document.addEventListener('ms-slide-drag', function (event) {
        lock(cardOf(event.target));
    });

    /**
     * Наведение: карточка делится по ширине на столько равных зон, сколько у неё видов.
     * Ширину берём у карточки, число зон — у точек, поэтому и две картинки, и четыре
     * работают без отдельного правила.
     */
    document.addEventListener('mousemove', function (event) {
        if (!HOVER.matches) {
            return;
        }
        var card = cardOf(event.target);
        var dots = dotsOf(card);
        if (dots.length < 2 || (card && card.dataset.galleryChosen)) {
            return;
        }

        var box = card.getBoundingClientRect();
        var zone = Math.floor((event.clientX - box.left) / box.width * dots.length);
        show(card, Math.max(0, Math.min(dots.length - 1, zone)));
    });

    // Курсор ушёл с карточки — возвращаем первый вид: иначе сетка застывает в случайном
    // наборе, у каждой карточки своём.
    document.addEventListener('mouseout', function (event) {
        var card = cardOf(event.target);
        if (card && !card.dataset.galleryChosen && !card.contains(event.relatedTarget)) {
            show(card, 0);
        }
    });

    /**
     * Карточку целиком кроет ссылка-подложка, и свайп по ней браузер местами досчитывает
     * до нажатия: палец пролистал бы вид и тут же уехал на страницу квартиры. Гасим на
     * перехвате — обычный обработчик отработал бы уже после перехода.
     */
    var swipedAt = 0;
    document.addEventListener('ms-slide-drag', function (event) {
        // Только после пальца: на ПК после жеста трекпадом человек может сразу щёлкнуть по
        // карточке, и съеденный клик раздражал бы сильнее случайного перехода.
        if (cardOf(event.target) && event.detail && event.detail.source === 'touch') {
            swipedAt = Date.now();
        }
    });
    document.addEventListener('click', function (event) {
        if (Date.now() - swipedAt < 400) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);
}());

/* End */
;
; /* Start:"a:4:{s:4:"full";s:70:"/local/templates/masterstroy/assets/js/common-blocks.js?17880152709262";s:6:"source";s:55:"/local/templates/masterstroy/assets/js/common-blocks.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function () {
    'use strict';
    var init = function () {
        var money = function (value) { return Math.max(0, Math.round(value)).toLocaleString('ru-RU') + ' ₽'; };
        var moneyNumber = function (input) { return Number(String(input.value || '').replace(/[^0-9]/g, '')) || 0; };
        var setRangeProgress = function (input) { var min = Number(input.min || 0); var max = Number(input.max || 100); var value = Number(input.value || min); var progress = max > min ? (value - min) / (max - min) * 100 : 0; input.style.setProperty('--range-progress', Math.max(0, Math.min(100, progress)) + '%'); };
        document.querySelectorAll('[data-common-calculator]').forEach(function (root) {
            var price = root.querySelector('[data-calculator-price]'); var down = root.querySelector('[data-calculator-down]'); var term = root.querySelector('[data-calculator-term]'); var downPercent = root.querySelector('[data-calculator-down-percent]'); var ownField = root.querySelector('[data-calculator-own-rate]');
            var minimumDown = function (priceValue) { return Math.ceil(Math.max(0, priceValue) * 201 / 1000); };
            var clampDown = function (value, priceValue) { return Math.min(priceValue, Math.max(minimumDown(priceValue), value)); };
            // Ставка, набранная вручную, перекрывает программу: акционную ставку банка
            // в список программ не заводят. Недобранное значение («,», пусто) — не ставка.
            var ownRate = function () { var raw = ownField ? ownField.value.replace(',', '.') : ''; return raw !== '' && isFinite(parseFloat(raw)) ? parseFloat(raw) : null; };
            var update = function () { var priceValue = moneyNumber(price); var downValue = clampDown(moneyNumber(down), priceValue); var own = ownRate(); var rate = own !== null ? own : Number((root.querySelector('input[name="mortgage-program"]:checked') || {}).value || 6); root.classList.toggle('is-own-rate', own !== null); var years = Number(term.value); var capital = root.querySelector('[data-calculator-capital]').checked ? 690266 : 0; var principal = Math.max(0, priceValue - downValue - capital); var monthlyRate = rate / 1200; var months = years * 12; var payment = principal && monthlyRate ? principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1) : principal / months; var overpayment = Math.max(0, payment * months - principal); root.querySelector('[data-calculator-credit]').textContent = money(principal); root.querySelector('[data-calculator-payment]').textContent = money(payment || 0); root.querySelector('[data-calculator-income]').textContent = money((payment || 0) * 2.5); root.querySelector('[data-calculator-rate]').textContent = money(overpayment); root.querySelector('[data-calculator-years]').textContent = years; if (downPercent) downPercent.textContent = (priceValue ? Math.round(downValue / priceValue * 1000) / 10 : 0).toLocaleString('ru-RU') + '%'; };
            // Слайдеры стоимости и взноса (макет 0:866-0:880): двусторонняя синхронизация с числовыми полями
            var priceRange = root.querySelector('[data-calculator-price-range]');
            var downRange = root.querySelector('[data-calculator-down-range]');
            var downClampTimer = 0;
            var syncRanges = function (source) {
                if (source === priceRange) price.value = money(priceRange.value); else priceRange.value = moneyNumber(price);
                var normalizedPrice = Number(priceRange.value);
                if (source === price) price.value = money(normalizedPrice);
                if (downRange) {
                    var minDown = minimumDown(normalizedPrice);
                    down.min = String(minDown);
                    downRange.min = String(minDown);
                    downRange.max = normalizedPrice;
                    var normalizedDown = clampDown(source === downRange ? Number(downRange.value) : moneyNumber(down), normalizedPrice);
                    downRange.value = normalizedDown;
                    if (source === downRange || source === down || source === price || moneyNumber(down) !== normalizedDown) down.value = money(normalizedDown);
                }
                [priceRange, downRange, term].forEach(function (range) { if (range) setRangeProgress(range); });
            };
            [price, down].forEach(function (input) { input.addEventListener('focus', function () { input.value = String(moneyNumber(input)); input.select(); }); input.addEventListener('blur', function () { syncRanges(input); update(); }); });
            root.querySelectorAll('input').forEach(function (input) { input.addEventListener('input', function () { if (input === ownField) { var typed = input.value.replace(/[^0-9.,]/g, '').match(/^\d{0,2}([.,]\d{0,2})?/); input.value = typed ? typed[0] : ''; update(); return; } if (input.name === 'mortgage-program' && ownField) ownField.value = ''; if (input === price || input === down) { input.value = input.value.replace(/[^0-9]/g, ''); if (input === down) { window.clearTimeout(downClampTimer); downClampTimer = window.setTimeout(function () { syncRanges(down); update(); }, 450); } update(); return; } syncRanges(input); update(); }); }); syncRanges(); price.value = money(priceRange.value); down.value = money(downRange.value); update();
        });
        document.querySelectorAll('[data-common-slider]').forEach(function (root) { var viewport = root.querySelector('[data-common-viewport]'); var move = function (direction) { viewport.scrollBy({left: direction * Math.min(620, viewport.clientWidth), behavior: 'smooth'}); }; var prev = root.querySelector('[data-common-prev]'); var next = root.querySelector('[data-common-next]'); prev.addEventListener('click', function () { move(-1); }); next.addEventListener('click', function () { move(1); }); window.msArrowEdges(viewport, prev, next); });
        document.querySelectorAll('[data-home-news]').forEach(function (root) {
            var button = root.querySelector('[data-home-news-more]');
            if (!button) return;
            button.addEventListener('click', function () {
                var expanded = root.classList.toggle('is-expanded');
                button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                var label = button.querySelector('span');
                if (label) label.textContent = expanded ? 'Скрыть новости' : 'Читать все новости';
                window.dispatchEvent(new Event('resize'));
            });
        });
        document.querySelectorAll('[data-callback-form]').forEach(function (wrapper) {
            var pageInput = wrapper.querySelector('[data-callback-page-field] input');
            if (pageInput) pageInput.value = window.location.pathname + window.location.search;
        });
        document.querySelectorAll('[data-project-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!window.fetch) return;
                var button = form.querySelector('button[type="submit"]');
                var status = form.querySelector('[data-form-status]');
                if (!button || !status) return; // нет обязательных узлов — оставляем нативную отправку
                event.preventDefault();
                button.disabled = true;
                status.textContent = 'Отправляем заявку…';
                fetch(form.action, {method: 'POST', body: new FormData(form), credentials: 'same-origin', headers: {'X-Requested-With': 'XMLHttpRequest'}})
                    .then(function (response) { if (!response.ok) throw new Error('request'); return response.json(); })
                    .then(
                        function () { form.reset(); status.textContent = 'Спасибо! Мы свяжемся с вами в течение 15 минут.'; button.textContent = 'Заявка отправлена'; },
                        function () {
                            // Номер приходит атрибутом из настроек сайта: держать его
                            // здесь значило бы оставить одно вхождение, которое правится
                            // выкладкой, а не в админке.
                            var fallbackPhone = form.getAttribute('data-fallback-phone') || '';
                            status.textContent = fallbackPhone
                                ? 'Не удалось отправить заявку. Позвоните нам: ' + fallbackPhone + '.'
                                : 'Не удалось отправить заявку. Попробуйте позвонить нам.';
                            button.disabled = false;
                        }
                    );
            });
        });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());

/* End */
;
; /* Start:"a:4:{s:4:"full";s:72:"/local/templates/masterstroy/assets/js/project-detail.js?178670439222704";s:6:"source";s:56:"/local/templates/masterstroy/assets/js/project-detail.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function(){
    'use strict';

    var init = function(){
        var mapActionMedia = window.matchMedia('(min-width: 1280px)');
        var syncMapActionOrder = function(){
            var modifiers = mapActionMedia.matches ? ['yandex', '2gis', 'route'] : ['route', '2gis', 'yandex'];
            document.querySelectorAll('.project-detail__map-actions').forEach(function(root){
                modifiers.forEach(function(modifier){
                    var action = root.querySelector('.project-detail__map-action--' + modifier);
                    if (action) root.appendChild(action);
                });
            });
        };
        if (mapActionMedia.addEventListener) mapActionMedia.addEventListener('change', syncMapActionOrder);
        else if (mapActionMedia.addListener) mapActionMedia.addListener(syncMapActionOrder);
        syncMapActionOrder();

        document.querySelectorAll('[data-hero-slider]').forEach(function(root){
            var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
            var counter = root.querySelector('[data-hero-counter]');
            if (slides.length < 2) return;
            var index = 0;
            var requested = 0;
            var load = function(slide){
                var source = slide.getAttribute('data-src');
                if (!source) return;
                if (!slide.getAttribute('src')) slide.setAttribute('src', source);
            };
            var previous = root.querySelector('[data-hero-prev]');
            var next = root.querySelector('[data-hero-next]');
            var activate = function(nextIndex){
                index = nextIndex;
                slides.forEach(function(slide, slideIndex){ slide.classList.toggle('is-active', slideIndex === index); });
                if (counter) counter.textContent = String(index + 1).padStart(2, '0') + '/' + String(slides.length).padStart(2, '0');
                window.msArrowEdgesByIndex(previous, next, index, slides.length);
            };
            var show = function(next){
                // Упор в края вместо кольца: в макете «назад» неактивна на 40% при
                // счётчике 01 (компонент-сеты 0:1187 / 0:1982, issue #223).
                var nextIndex = Math.max(0, Math.min(slides.length - 1, next));
                var target = slides[nextIndex];
                requested = nextIndex;
                if (!target.getAttribute('data-src')) { activate(nextIndex); return; }
                var onError = function(){
                    target.removeEventListener('load', onLoad);
                    target.removeEventListener('error', onError);
                    target.removeAttribute('src');
                };
                var onLoad = function(){
                    target.removeEventListener('load', onLoad);
                    target.removeEventListener('error', onError);
                    target.removeAttribute('data-src');
                    if (requested === nextIndex) activate(nextIndex);
                };
                target.addEventListener('load', onLoad);
                target.addEventListener('error', onError);
                load(target);
                if (target.complete && target.naturalWidth > 0) onLoad();
            };
            if (previous) previous.addEventListener('click', function(){ show(requested - 1); });
            if (next) next.addEventListener('click', function(){ show(requested + 1); });
            activate(0);
        });

        document.querySelectorAll('[data-project-detail-slider]').forEach(function(root){
            var viewport = root.querySelector('[data-slider-viewport]');
            var move = function(direction){ viewport.scrollBy({left: direction * Math.min(viewport.clientWidth, 952), behavior: 'smooth'}); };
            var prev = root.querySelector('[data-slider-prev]');
            var next = root.querySelector('[data-slider-next]');
            if (prev) prev.addEventListener('click', function(){ move(-1); });
            if (next) next.addEventListener('click', function(){ move(1); });
            window.msArrowEdges(viewport, prev, next);
        });

        document.querySelectorAll('[data-project-detail-tabs]').forEach(function(root){
            root.querySelectorAll('[data-tab]').forEach(function(button){
                button.addEventListener('click', function(){
                    root.querySelectorAll('[data-tab]').forEach(function(item){ item.classList.toggle('is-active', item === button); });
                    root.querySelectorAll('[data-tab-panel]').forEach(function(panel){ panel.hidden = panel.dataset.tabPanel !== button.dataset.tab; });
                    root.classList.toggle('is-infra', button.dataset.tab === 'infrastructure');
                });
            });
        });

        document.querySelectorAll('[data-infra-slider]').forEach(function(root){
            var slides = Array.prototype.slice.call(root.querySelectorAll('[data-infra-slide]'));
            if (!slides.length) return;
            var counter = root.querySelector('[data-infra-counter]');
            var index = 0;
            var prev = root.querySelector('[data-infra-prev]');
            var next = root.querySelector('[data-infra-next]');
            var show = function(nextIndex){
                // Упор в края вместо кольца — см. hero-слайдер выше (issue #223).
                index = Math.max(0, Math.min(slides.length - 1, nextIndex));
                slides.forEach(function(slide, slideIndex){ slide.classList.toggle('is-active', slideIndex === index); });
                if (counter) counter.textContent = String(index + 1).padStart(2, '0') + '/' + String(slides.length).padStart(2, '0');
                window.msArrowEdgesByIndex(prev, next, index, slides.length);
            };
            if (prev) prev.addEventListener('click', function(){ show(index - 1); });
            if (next) next.addEventListener('click', function(){ show(index + 1); });
            show(0);
        });

        document.querySelectorAll('[data-masterplan]').forEach(function(root){
            var tooltip = root.querySelector('[data-masterplan-tooltip]');
            var title = tooltip && tooltip.querySelector('[data-masterplan-tooltip-title]');
            var description = tooltip && tooltip.querySelector('[data-masterplan-tooltip-description]');
            var active = null;
            var closeTimer = null;
            // На узких экранах план шире окна и панорамируется внутри обёртки (issue #282).
            var scroller = root.closest('[data-masterplan-scroll]');
            if (!tooltip || !title || !description) return;
            var reveal = function(){
                if (closeTimer) window.clearTimeout(closeTimer);
                tooltip.hidden = false;
                tooltip.setAttribute('aria-hidden', 'false');
                window.requestAnimationFrame(function(){ tooltip.dataset.open = 'true'; });
            };
            var close = function(){
                if (active) active.setAttribute('aria-expanded', 'false');
                active = null;
                tooltip.dataset.open = 'false';
                tooltip.setAttribute('aria-hidden', 'true');
                if (closeTimer) window.clearTimeout(closeTimer);
                closeTimer = window.setTimeout(function(){
                    if (tooltip.dataset.open === 'false') tooltip.hidden = true;
                }, 220);
            };
            var clamp = function(value, min, max){ return Math.max(min, Math.min(max, value)); };
            var position = function(point){
                var rootBox = root.getBoundingClientRect();
                var pointBox = point.getBoundingClientRect();
                var gap = 12;
                var pad = 12;
                // Видимая часть плана — пересечение с окном И с прокручиваемой обёрткой:
                // при панорамировании план обрезает именно она, а она бывает уже окна на
                // ширину полей секции. Считать только по окну означало выпустить плашку под
                // обрез контейнера (issue #282).
                var clipBox = scroller ? scroller.getBoundingClientRect() : null;
                var clipLeft = Math.max(rootBox.left, 0, clipBox ? clipBox.left : 0);
                var clipRight = Math.min(rootBox.right, window.innerWidth, clipBox ? clipBox.right : window.innerWidth);
                var clipTop = Math.max(rootBox.top, 0, clipBox ? clipBox.top : 0);
                var clipBottom = Math.min(rootBox.bottom, window.innerHeight, clipBox ? clipBox.bottom : window.innerHeight);
                var visibleHeight = clipBottom - clipTop;
                tooltip.style.maxHeight = Math.max(44, Math.min(rootBox.height - pad * 2, visibleHeight - pad * 2)) + 'px';
                var width = tooltip.offsetWidth;
                var height = tooltip.offsetHeight;
                var viewportLeft = clipLeft + pad;
                var viewportRight = clipRight - pad;
                var viewportTop = clipTop + pad;
                var viewportBottom = clipBottom - pad;
                var minLeft = Math.max(pad, viewportLeft - rootBox.left);
                var maxLeft = Math.min(rootBox.width - width - pad, viewportRight - rootBox.left - width);
                var minTop = Math.max(pad, viewportTop - rootBox.top);
                var maxTop = Math.min(rootBox.height - height - pad, viewportBottom - rootBox.top - height);
                if (maxLeft < minLeft) { minLeft = pad; maxLeft = Math.max(pad, rootBox.width - width - pad); }
                if (maxTop < minTop) { minTop = pad; maxTop = Math.max(pad, rootBox.height - height - pad); }
                var right = pointBox.right + gap - rootBox.left;
                var left = pointBox.left - gap - rootBox.left - width;
                var below = pointBox.bottom + gap - rootBox.top;
                var above = pointBox.top - gap - rootBox.top - height;
                var useLeft = right > maxLeft && left >= minLeft;
                var useAbove = below > maxTop && above >= minTop;
                tooltip.style.left = clamp(useLeft ? left : right, minLeft, maxLeft) + 'px';
                tooltip.style.top = clamp(useAbove ? above : below, minTop, maxTop) + 'px';
                tooltip.dataset.horizontal = useLeft ? 'left' : 'right';
                tooltip.dataset.vertical = useAbove ? 'above' : 'below';
            };
            var open = function(point){
                title.textContent = point.dataset.masterplanTitle || '';
                description.textContent = point.dataset.masterplanDescription || '';
                description.hidden = description.textContent === '';
                if (active && active !== point) active.setAttribute('aria-expanded', 'false');
                active = point;
                point.setAttribute('aria-expanded', 'true');
                reveal();
                position(point);
            };
            root.querySelectorAll('[data-masterplan-point]').forEach(function(point){
                // focus/mouseenter могут открыть подсказку раньше click. Клик
                // поэтому всегда подтверждает открытие, а не тут же закрывает её.
                // Закрытие остаётся по Escape, клику вне генплана и mouseleave.
                point.addEventListener('click', function(event){ event.stopPropagation(); open(point); });
                point.addEventListener('focus', function(){ open(point); });
                point.addEventListener('mouseenter', function(){ if (window.matchMedia('(hover: hover)').matches) open(point); });
            });
            root.addEventListener('focusout', function(event){
                if (!event.relatedTarget || !root.contains(event.relatedTarget)) close();
            });
            root.addEventListener('mouseleave', function(){ if (window.matchMedia('(hover: hover)').matches) close(); });
            document.addEventListener('click', function(event){ if (!root.contains(event.target)) close(); });
            document.addEventListener('keydown', function(event){ if (event.key === 'Escape') close(); });
            window.addEventListener('scroll', function(){ if (active) position(active); }, {passive: true});
            window.addEventListener('resize', function(){ if (active) position(active); });
            // Видимая часть плана меняется и от прокрутки самой обёртки, не только страницы.
            if (scroller) {
                // Кадр по центру плана, а не от левого края. Это не выбор за дизайнера: в
                // мобильном макете (0:7522) сдвиг −291 на плане 984 при вьюпорте 402 даёт
                // центр видимой части 472 против центра плана 492 — кадр там центрирован.
                // У левого края «Лесного» стоит лес, а дома уезжают за экран.
                var panned = false;
                var selfScroll = false;
                var centre = function(){
                    if (panned) return;
                    selfScroll = true;
                    scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) / 2;
                };
                scroller.addEventListener('scroll', function(){
                    // Посетитель сдвинул план сам — его положение важнее нашего центрирования,
                    // перебрасывать кадр под пальцем нельзя. Своя же установка scrollLeft за
                    // панорамирование не считается (issue #292).
                    if (selfScroll) selfScroll = false; else panned = true;
                    if (active) position(active);
                }, {passive: true});
                // Ширина меняется и после загрузки: поворот телефона, смена ориентации
                // планшета. Однократного центрирования тут мало.
                window.addEventListener('resize', centre);
                centre();
            }
        });

        document.querySelectorAll('[data-project-apartments-more]').forEach(function(button){
            button.addEventListener('click', function(){
                var root = button.closest('.project-detail__apartments');
                if (!root) return;
                var wasExpanded = root.classList.contains('is-expanded');
                var buttonTop = button.getBoundingClientRect().top;
                root.classList.toggle('is-expanded');
                var expanded = root.classList.contains('is-expanded');
                button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                button.textContent = expanded ? button.dataset.expandedLabel : button.dataset.collapsedLabel;
                if (wasExpanded) window.scrollBy(0, button.getBoundingClientRect().top - buttonTop);
            });
        });

        var quickFilter = document.querySelector('.project-detail__quick-filter');
        var quickFilterForm = quickFilter && quickFilter.querySelector('form');
        var quickFilterTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-project-filter]'));
        var quickFilterClosers = quickFilter ? quickFilter.querySelectorAll('[data-project-filter-close]') : [];
        var quickFilterSwipe = quickFilter && quickFilter.querySelector('[data-project-filter-swipe]');
        var quickObjectOption = quickFilter && quickFilter.querySelector('.project-detail__quick-object option[data-desktop-label]');
        var quickQueueOption = quickFilter && quickFilter.querySelector('.project-detail__quick-queue option[data-desktop-label]');
        var quickFilterLastFocus = null;
        var quickFilterStartY = 0;
        var quickFilterDragging = false;

        function projectFilterMobile() { return window.matchMedia('(max-width: 700px)').matches; }
        function syncProjectFilterObjectLabel() {
            if (quickObjectOption) {
                quickObjectOption.textContent = window.matchMedia('(min-width: 1280px)').matches
                    ? quickObjectOption.dataset.desktopLabel
                    : quickObjectOption.dataset.compactLabel;
            }
            if (quickQueueOption) {
                quickQueueOption.textContent = window.matchMedia('(min-width: 1600px)').matches
                    ? quickQueueOption.dataset.desktopLabel
                    : quickQueueOption.dataset.compactLabel;
            }
        }
        function projectFilterFocusable() {
            if (!quickFilterForm) return [];
            return Array.prototype.slice.call(quickFilterForm.querySelectorAll('select, input:not([type="hidden"]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'));
        }
        function setProjectFilterOpen(open, restoreFocus) {
            if (!quickFilter || !quickFilterForm || !projectFilterMobile()) return;
            quickFilter.classList.toggle('is-filter-open', open);
            document.body.classList.toggle('has-project-filter', open);
            quickFilterForm.setAttribute('role', 'dialog');
            quickFilterForm.setAttribute('aria-modal', 'true');
            quickFilterForm.setAttribute('aria-hidden', open ? 'false' : 'true');
            quickFilterForm.toggleAttribute('inert', !open);
            quickFilterTriggers.forEach(function (trigger) { trigger.setAttribute('aria-expanded', open ? 'true' : 'false'); });
            if (open) {
                quickFilterLastFocus = document.activeElement;
                window.requestAnimationFrame(function () {
                    var focusable = projectFilterFocusable();
                    if (focusable.length) focusable[0].focus();
                });
            } else if (restoreFocus !== false && quickFilterLastFocus && typeof quickFilterLastFocus.focus === 'function') {
                quickFilterLastFocus.focus();
                quickFilterLastFocus = null;
            }
        }
        function syncProjectFilterMode() {
            if (!quickFilterForm) return;
            syncProjectFilterObjectLabel();
            if (projectFilterMobile()) {
                if (!quickFilter.classList.contains('is-filter-open')) {
                    quickFilterForm.setAttribute('aria-hidden', 'true');
                    quickFilterForm.setAttribute('inert', '');
                }
            } else {
                quickFilter.classList.remove('is-filter-open');
                document.body.classList.remove('has-project-filter');
                quickFilterForm.removeAttribute('role');
                quickFilterForm.removeAttribute('aria-modal');
                quickFilterForm.removeAttribute('aria-hidden');
                quickFilterForm.removeAttribute('inert');
                quickFilterTriggers.forEach(function (trigger) { trigger.setAttribute('aria-expanded', 'false'); });
            }
        }
        quickFilterTriggers.forEach(function(button){ button.addEventListener('click', function(){ setProjectFilterOpen(true); }); });
        Array.prototype.forEach.call(quickFilterClosers, function(button){
            button.addEventListener('pointerdown', function(){ setProjectFilterOpen(false); });
            button.addEventListener('mousedown', function(){ setProjectFilterOpen(false); });
            button.addEventListener('click', function(){ setProjectFilterOpen(false); });
        });
        document.addEventListener('pointerdown', function(event){
            if (event.target && event.target.matches && event.target.matches('[data-project-filter-close]')) setProjectFilterOpen(false);
        }, true);
        document.addEventListener('mousedown', function(event){
            if (event.target && event.target.matches && event.target.matches('[data-project-filter-close]')) setProjectFilterOpen(false);
        }, true);
        if (quickFilter) {
            quickFilter.addEventListener('click', function(event){
                if (event.target && event.target.closest('[data-project-filter-close]')) setProjectFilterOpen(false);
            });
        }
        document.addEventListener('keydown', function(event){
            if (!quickFilter || !quickFilter.classList.contains('is-filter-open')) return;
            if (event.key === 'Escape') { event.preventDefault(); setProjectFilterOpen(false); return; }
            if (event.key !== 'Tab') return;
            var focusable = projectFilterFocusable();
            if (!focusable.length) return;
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        });
        if (quickFilterSwipe) {
            function moveProjectFilterSwipe(clientY) {
                if (quickFilterDragging && clientY - quickFilterStartY > 70) {
                    quickFilterDragging = false;
                    setProjectFilterOpen(false);
                }
            }
            quickFilterSwipe.addEventListener('pointerdown', function(event){ quickFilterStartY = event.clientY; quickFilterDragging = true; quickFilterSwipe.setPointerCapture(event.pointerId); });
            quickFilterSwipe.addEventListener('pointermove', function(event){ moveProjectFilterSwipe(event.clientY); });
            quickFilterSwipe.addEventListener('pointerup', function(event){ moveProjectFilterSwipe(event.clientY); quickFilterDragging = false; });
            quickFilterSwipe.addEventListener('pointercancel', function(){ quickFilterDragging = false; });
        }
        window.addEventListener('resize', syncProjectFilterMode);
        syncProjectFilterMode();
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());

/* End */
;
; /* Start:"a:4:{s:4:"full";s:61:"/local/templates/masterstroy/assets/js/chat.js?17878172184193";s:6:"source";s:46:"/local/templates/masterstroy/assets/js/chat.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function () {
    'use strict';

    function init() {
    var widget = document.querySelector('[data-chat-widget]');
    if (!widget) return;
    var dialog = widget.querySelector('[data-chat-dialog]');
    var launcher = widget.querySelector('[data-chat-open]');
    var form = widget.querySelector('[data-chat-form]');
    var status = widget.querySelector('[data-chat-status]');
    var pageField = form.querySelector('[name="page"]');
    var phoneField = form.querySelector('[name="phone"]');
    var emailField = form.querySelector('[name="email"]');
    var lastFocus = null;
    var focusableElements = 'button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled])';

    function open() {
        if (!dialog.hidden) return;
        lastFocus = document.activeElement;
        dialog.hidden = false;
        launcher.hidden = true;
        launcher.setAttribute('aria-expanded', 'true');
        if (pageField) pageField.value = window.location.pathname + window.location.search;
        var first = dialog.querySelector(focusableElements);
        if (first) first.focus();
    }

    function close() {
        dialog.hidden = true;
        launcher.hidden = false;
        launcher.setAttribute('aria-expanded', 'false');
        if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
        else launcher.focus();
    }

    document.querySelectorAll('.js-chat-open').forEach(function (button) {
        button.addEventListener('click', function () { open(); });
    });
    launcher.addEventListener('click', open);
    widget.querySelectorAll('[data-chat-close]').forEach(function (button) { button.addEventListener('click', close); });

    document.addEventListener('keydown', function (event) {
        if (dialog.hidden) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
            return;
        }
        if (event.key !== 'Tab') return;
        var items = Array.prototype.slice.call(dialog.querySelectorAll(focusableElements));
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (pageField) pageField.value = window.location.pathname + window.location.search;
        var hasContact = (phoneField && phoneField.value.trim()) || (emailField && emailField.value.trim());
        if (emailField) emailField.setCustomValidity(hasContact ? '' : 'Укажите телефон или email');
        if (!form.reportValidity()) return;
        var submit = form.querySelector('[type="submit"]');
        submit.disabled = true;
        status.classList.remove('is-success');
        status.textContent = 'Отправляем сообщение…';
        fetch(form.action, { method: 'POST', body: new FormData(form), credentials: 'same-origin' })
            .then(function (response) { return response.json().then(function (body) { return { ok: response.ok, body: body }; }); })
            .then(function (result) {
                if (!result.ok || !result.body.ok) throw new Error(result.body.error || 'delivery');
                status.classList.add('is-success');
                status.textContent = 'Спасибо! Специалист получил ваш вопрос.';
                form.querySelector('[name="message"]').value = '';
            })
            .catch(function () { status.textContent = 'Не удалось отправить сообщение. Попробуйте ещё раз.'; })
            .finally(function () { submit.disabled = false; });
    });
    [phoneField, emailField].forEach(function (field) {
        if (field) field.addEventListener('input', function () { if (emailField) emailField.setCustomValidity(''); });
    });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

/* End */
;; /* /local/templates/masterstroy/script.js?178670439411872*/
; /* /local/templates/masterstroy/assets/js/cookie-consent.js?17879152893281*/
; /* /local/templates/masterstroy/assets/js/favorites.js?17867043926118*/
; /* /local/templates/masterstroy/assets/js/header.js?17867043929444*/
; /* /local/templates/masterstroy/assets/js/gallery-swipe.js?17867043929123*/
; /* /local/templates/masterstroy/assets/js/apartment-card.js?17867043926561*/
; /* /local/templates/masterstroy/assets/js/common-blocks.js?17880152709262*/
; /* /local/templates/masterstroy/assets/js/project-detail.js?178670439222704*/
; /* /local/templates/masterstroy/assets/js/chat.js?17878172184193*/
