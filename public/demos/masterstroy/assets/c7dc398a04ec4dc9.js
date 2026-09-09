
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
; /* Start:"a:4:{s:4:"full";s:73:"/local/templates/masterstroy/assets/js/projects-catalog.js?17867043925684";s:6:"source";s:58:"/local/templates/masterstroy/assets/js/projects-catalog.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function () {
    'use strict';

    var init = function () {
        document.querySelectorAll('[data-projects-catalog]').forEach(function (root) {
            var form = root.querySelector('[data-projects-filter]');
            if (!form) return;

            var toggle = root.querySelector('[data-projects-filter-toggle]');
            var location = root.querySelector('[data-projects-location]');
            var queue = root.querySelector('[data-projects-queue]');
            var prices = form.querySelectorAll('.projects-catalog__price input');
            var cards = Array.prototype.slice.call(root.querySelectorAll('.project-catalog-card'));
            var empty = root.querySelector('[data-projects-empty]');
            var more = root.querySelector('[data-projects-more]');
            var submit = root.querySelector('[data-projects-submit]');
            var expanded = false;

            var label = function (count) {
                var mod100 = count % 100;
                var mod10 = count % 10;
                var word = mod100 >= 11 && mod100 <= 14 ? 'проектов' : mod10 === 1 ? 'проект' : mod10 >= 2 && mod10 <= 4 ? 'проекта' : 'проектов';
                return 'Смотреть ' + count + ' ' + word;
            };

            var priceValue = function (input, fallback) {
                var digits = input.value.replace(/\D/g, '');
                return digits === '' ? fallback : Number(digits);
            };

            var requestedStatus = null;
            if (typeof window.URLSearchParams === 'function') {
                requestedStatus = new window.URLSearchParams(window.location.search).get('status');
            } else {
                var statusMatch = window.location.search.match(/[?&]status=([^&]+)/);
                if (statusMatch) requestedStatus = decodeURIComponent(statusMatch[1].replace(/\+/g, ' '));
            }
            if (requestedStatus === 'completed') requestedStatus = 'ready';
            if (requestedStatus !== 'ready' && requestedStatus !== 'building') requestedStatus = null;
            if (requestedStatus === 'ready' || requestedStatus === 'building') {
                var requestedPrices = cards.map(function (card) {
                    return card.dataset.status === requestedStatus ? Number(card.dataset.price) : NaN;
                }).filter(function (price) {
                    return isFinite(price) && price >= 0;
                });
                if (prices.length >= 2 && requestedPrices.length > 0) {
                    var formatPriceBound = function (input, value) {
                        var prefix = input.dataset.prefix || '';
                        var formatted = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
                        input.placeholder = (prefix ? prefix + ' ' : '') + formatted;
                    };
                    formatPriceBound(prices[0], Math.min.apply(Math, requestedPrices));
                    formatPriceBound(prices[1], Math.max.apply(Math, requestedPrices));
                }
            }

            var apply = function () {
                var eligible = [];
                var min = priceValue(prices[0], 0);
                var max = priceValue(prices[1], Infinity);
                cards.forEach(function (card) {
                    var price = Number(card.dataset.price);
                    var matchesQueue = !queue || queue.value === 'all'
                        || String(card.dataset.queues || '').indexOf('|' + queue.value + '|') !== -1;
                    var matches = (location.value === 'all' || card.dataset.location === location.value)
                        && (!requestedStatus || card.dataset.status === requestedStatus)
                        && matchesQueue
                        && price >= min
                        && price <= max;
                    if (matches) eligible.push(card);
                });
                cards.forEach(function (card) {
                    var index = eligible.indexOf(card);
                    var limited = window.innerWidth <= 700 && !expanded && index >= 3;
                    card.hidden = index === -1 || limited;
                });
                empty.hidden = eligible.length > 0;
                if (submit) submit.textContent = label(eligible.length);
                if (more) {
                    more.hidden = window.innerWidth > 700 || eligible.length <= 3;
                    more.textContent = expanded ? 'Скрыть' : 'Смотреть все';
                }
            };

            if (toggle) {
                toggle.addEventListener('click', function () {
                    var open = form.classList.toggle('is-open');
                    toggle.setAttribute('aria-expanded', String(open));
                });
            }
            if (more) {
                more.addEventListener('click', function () {
                    expanded = !expanded;
                    apply();
                });
            }
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                expanded = false;
                apply();
                form.classList.remove('is-open');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
            });
            form.addEventListener('reset', function () {
                expanded = false;
                window.setTimeout(apply, 0);
            });
            window.addEventListener('resize', apply);
            apply();
        });
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
; /* /local/templates/masterstroy/assets/js/common-blocks.js?17880152709262*/
; /* /local/templates/masterstroy/assets/js/projects-catalog.js?17867043925684*/
; /* /local/templates/masterstroy/assets/js/chat.js?17878172184193*/
