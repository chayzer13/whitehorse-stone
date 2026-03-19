document.addEventListener('DOMContentLoaded', () => {

    // ===== HEADER SCROLL =====
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('header--scrolled', window.scrollY > 20);
    });

    // ===== BURGER MENU =====
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const navOverlay = document.getElementById('navOverlay');

    function toggleMenu(open) {
        const isOpen = typeof open === 'boolean' ? open : !nav.classList.contains('active');
        burger.classList.toggle('active', isOpen);
        nav.classList.toggle('active', isOpen);
        if (navOverlay) navOverlay.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    burger.addEventListener('click', () => toggleMenu());
    if (navOverlay) navOverlay.addEventListener('click', () => toggleMenu(false));

    nav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    // ===== PRODUCT MODAL =====
    const modalOverlay = document.getElementById('productModal');
    const modalClose = document.getElementById('modalClose');
    const modalCarouselTrack = document.getElementById('modalCarouselTrack');
    const modalDots = document.getElementById('modalDots');
    const modalPrev = document.getElementById('modalPrev');
    const modalNext = document.getElementById('modalNext');
    const modalType = document.getElementById('modalType');
    let carouselIndex = 0;
    let carouselSlides = [];
    const modalName = document.getElementById('modalName');
    const modalDesc = document.getElementById('modalDesc');
    const modalColorPicker = document.getElementById('modalColorPicker');
    const modalSizePicker = document.getElementById('modalSizePicker');
    const modalPrice = document.getElementById('modalPrice');

    const colorMap = {
        'серый': '#9e9e9e', 'красный': '#c0392b', 'коричневый': '#795548',
        'чёрный': '#2c2c2c', 'терракот': '#c4631e', 'песочный': '#d4b896',
        'графит': '#555555', 'белый': '#f0f0f0', 'охра': '#cc7722',
        'микс': 'linear-gradient(135deg, #c4a882, #9e9e9e, #795548)',
        'бежевый': '#d4c4a8', 'антрацит': '#3a3a3a', 'зелёный': '#5a8a5a'
    };

    let currentVariations = [];
    let selectedColor = '';
    let selectedSize = '';
    let currentPriceUnit = '₽/м²';
    let currentColorPhotos = [];

    function updateModalPrice() {
        if (currentVariations.length === 0) return;
        const match = currentVariations.find(v =>
            v.color === selectedColor && v.size === selectedSize
        );
        if (match && match.price) {
            modalPrice.textContent = formatPrice(match.price, currentPriceUnit);
            modalPrice.style.animation = 'none';
            modalPrice.offsetHeight;
            modalPrice.style.animation = 'fadeIn 0.3s ease';
        }
    }

    function buildCarousel(photos, mainBg, mainPhoto) {
        modalCarouselTrack.innerHTML = '';
        carouselSlides = [];
        carouselIndex = 0;

        // Main photo/bg as first slide
        const firstSlide = document.createElement('div');
        firstSlide.className = 'modal__carousel-slide';
        if (mainPhoto) {
            firstSlide.style.background = 'url(' + encodeURI(mainPhoto) + ') center/cover no-repeat';
        } else {
            firstSlide.style.background = mainBg || '#c4a882';
        }
        modalCarouselTrack.appendChild(firstSlide);
        carouselSlides.push(firstSlide);

        // Color photos as additional slides
        photos.forEach(p => {
            if (p && p.url) {
                const slide = document.createElement('div');
                slide.className = 'modal__carousel-slide';
                slide.style.background = 'url(' + encodeURI(p.url) + ') center/cover no-repeat';
                modalCarouselTrack.appendChild(slide);
                carouselSlides.push(slide);
            }
        });

        renderCarouselDots();
        goToSlide(0);
    }

    function renderCarouselDots() {
        modalDots.innerHTML = '';
        if (carouselSlides.length <= 1) return;
        carouselSlides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'modal__carousel-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goToSlide(i));
            modalDots.appendChild(dot);
        });
    }

    function goToSlide(i) {
        carouselIndex = Math.max(0, Math.min(i, carouselSlides.length - 1));
        modalCarouselTrack.style.transform = 'translateX(-' + (carouselIndex * 100) + '%)';
        modalDots.querySelectorAll('.modal__carousel-dot').forEach((d, idx) => {
            d.classList.toggle('active', idx === carouselIndex);
        });
    }

    modalPrev.addEventListener('click', () => goToSlide(carouselIndex - 1));
    modalNext.addEventListener('click', () => goToSlide(carouselIndex + 1));

    function updateModalPhoto(colorName) {
        const photo = currentColorPhotos.find(p => p.color && p.color.toLowerCase() === colorName.toLowerCase());
        if (photo && photo.url) {
            if (carouselSlides[0]) {
                carouselSlides[0].style.background = 'url(' + encodeURI(photo.url) + ') center/cover no-repeat';
            }
            goToSlide(0);
        }
    }

    function renderSizePicker(variations, activeColor) {
        modalSizePicker.innerHTML = '';
        const sizes = [...new Set(variations.filter(v => v.color === activeColor).map(v => v.size))];
        if (sizes.length === 0) {
            // Fallback: show all unique sizes
            const allSizes = [...new Set(variations.map(v => v.size))];
            allSizes.forEach((size, i) => {
                const btn = document.createElement('button');
                btn.className = 'modal__size-btn' + (i === 0 ? ' active' : '');
                btn.textContent = size;
                btn.addEventListener('click', () => {
                    modalSizePicker.querySelectorAll('.modal__size-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    selectedSize = size;
                    updateModalPrice();
                });
                modalSizePicker.appendChild(btn);
            });
            if (allSizes.length > 0) selectedSize = allSizes[0];
        } else {
            sizes.forEach((size, i) => {
                const btn = document.createElement('button');
                btn.className = 'modal__size-btn' + (i === 0 ? ' active' : '');
                btn.textContent = size;
                btn.addEventListener('click', () => {
                    modalSizePicker.querySelectorAll('.modal__size-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    selectedSize = size;
                    updateModalPrice();
                });
                modalSizePicker.appendChild(btn);
            });
            selectedSize = sizes[0];
        }
    }

    function openModal(data) {
        // Parse color photos early for carousel
        try { currentColorPhotos = JSON.parse(data.photos || '[]'); } catch(e) { currentColorPhotos = []; }
        buildCarousel(currentColorPhotos, data.bg || '#c4a882', data.photo || '');
        modalType.textContent = data.type || '';
        modalName.textContent = data.name || '';
        modalDesc.textContent = data.desc || '';
        currentPriceUnit = data.price_unit || '₽/м²';

        // Parse variations
        let variations = [];
        try { variations = JSON.parse(data.variations || '[]'); } catch(e) {}
        currentVariations = variations;

        modalColorPicker.innerHTML = '';
        modalSizePicker.innerHTML = '';

        // Badge
        const existingBadge = modalName.parentElement.querySelector('.modal__badge');
        if (existingBadge) existingBadge.remove();
        if (data.badge) {
            const badgeEl = document.createElement('span');
            badgeEl.className = 'modal__badge';
            badgeEl.textContent = data.badge;
            modalType.insertAdjacentElement('afterend', badgeEl);
        }

        if (variations.length > 0) {
            // Build color picker from variations
            const uniqueColors = [...new Set(variations.map(v => v.color))];
            selectedColor = uniqueColors[0];

            uniqueColors.forEach((colorName, i) => {
                const btn = document.createElement('button');
                btn.className = 'modal__color-btn' + (i === 0 ? ' active' : '');
                btn.title = colorName;
                const bg = colorMap[colorName.toLowerCase()] || '#c4a882';
                if (bg.startsWith('linear')) {
                    btn.style.background = bg;
                } else {
                    btn.style.backgroundColor = bg;
                }
                btn.addEventListener('click', () => {
                    modalColorPicker.querySelectorAll('.modal__color-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    selectedColor = colorName;
                    renderSizePicker(variations, colorName);
                    updateModalPrice();
                    updateModalPhoto(colorName);
                });
                modalColorPicker.appendChild(btn);
            });

            renderSizePicker(variations, selectedColor);

            // Set initial price from first variation
            const first = variations.find(v => v.color === selectedColor && v.size === selectedSize) || variations[0];
            modalPrice.textContent = formatPrice(first.price, currentPriceUnit);
        } else {
            // No variations — use colors string + base price
            const colorsStr = data.colors || '';
            const colorList = colorsStr.split(',').map(c => c.trim()).filter(Boolean);
            selectedColor = colorList[0] || '';

            colorList.forEach((colorName, i) => {
                const btn = document.createElement('button');
                btn.className = 'modal__color-btn' + (i === 0 ? ' active' : '');
                btn.title = colorName;
                const bg = colorMap[colorName.toLowerCase()] || '#c4a882';
                if (bg.startsWith('linear')) {
                    btn.style.background = bg;
                } else {
                    btn.style.backgroundColor = bg;
                }
                btn.addEventListener('click', () => {
                    modalColorPicker.querySelectorAll('.modal__color-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    updateModalPhoto(colorName);
                });
                modalColorPicker.appendChild(btn);
            });

            // Show specs as single size
            if (data.specs) {
                const btn = document.createElement('button');
                btn.className = 'modal__size-btn active';
                btn.textContent = data.specs;
                modalSizePicker.appendChild(btn);
            }

            modalPrice.textContent = formatPrice(data.price, currentPriceUnit) || '';
        }

        // If there's a color photo for the first selected color, update first slide
        if (selectedColor && currentColorPhotos.length) {
            updateModalPhoto(selectedColor);
        }

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    window.closeModal = function() {
        modalOverlay.classList.remove('active');
        if (!nav.classList.contains('active')) {
            document.body.style.overflow = '';
        }
    };

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Attach click to all product/catalog cards
    document.querySelectorAll('[data-product]').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            try {
                const data = JSON.parse(card.getAttribute('data-product'));
                openModal(data);
            } catch (err) {
                // ignore
            }
        });
    });

    // ===== CALCULATOR =====
    const productRadios = document.querySelectorAll('input[name="productType"]');
    const pavingTypeBlock = document.getElementById('calcPavingType');
    const borderTypeBlock = document.getElementById('calcBorderType');
    const areaLabel = document.getElementById('calcAreaLabel');
    const calcBtn = document.getElementById('calcBtn');
    const calcValue = document.getElementById('calcValue');
    const pavingSelect = document.getElementById('pavingSelect');
    const borderSelect = document.getElementById('borderSelect');
    const areaInput = document.getElementById('calcAreaInput');
    const calcNameInput = document.getElementById('calcName');
    const calcPhoneInput = document.getElementById('calcPhone');

    // Load calculator products from API
    function loadCalcProducts() {
        fetch('/api/products')
            .then(r => r.json())
            .then(products => {
                const paving = products.filter(p => p.type !== 'Бордюр');
                const borders = products.filter(p => p.type === 'Бордюр');

                pavingSelect.innerHTML = '';
                paving.forEach(p => {
                    const priceNum = parseInt(String(p.price).replace(/\D/g, '')) || 0;
                    const unit = p.price_unit || '₽/м²';
                    const opt = document.createElement('option');
                    opt.value = priceNum;
                    opt.dataset.unit = unit;
                    opt.textContent = p.name + ' (от ' + priceNum.toLocaleString('ru-RU') + ' ' + unit + ')';
                    pavingSelect.appendChild(opt);
                });
                if (!paving.length) {
                    pavingSelect.innerHTML = '<option value="0">Нет товаров</option>';
                }

                borderSelect.innerHTML = '';
                borders.forEach(p => {
                    const priceNum = parseInt(String(p.price).replace(/\D/g, '')) || 0;
                    const unit = p.price_unit || '₽/шт';
                    const opt = document.createElement('option');
                    opt.value = priceNum;
                    opt.dataset.unit = unit;
                    opt.textContent = p.name + ' (от ' + priceNum.toLocaleString('ru-RU') + ' ' + unit + ')';
                    borderSelect.appendChild(opt);
                });
                if (!borders.length) {
                    borderSelect.innerHTML = '<option value="0">Нет товаров</option>';
                }
            })
            .catch(() => {});
    }

    loadCalcProducts();

    productRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isPaving = radio.value === 'paving';
            pavingTypeBlock.classList.toggle('hidden', !isPaving);
            borderTypeBlock.classList.toggle('hidden', isPaving);
            areaLabel.textContent = isPaving ? 'Площадь (м²)' : 'Количество (шт)';
            areaInput.placeholder = isPaving ? 'Введите площадь' : 'Введите количество';
            areaInput.value = isPaving ? '50' : '30';
        });
    });

    calcBtn.addEventListener('click', () => {
        const type = document.querySelector('input[name="productType"]:checked').value;
        const area = parseFloat(areaInput.value);

        if (!document.getElementById('calcConsent').checked) {
            showToast('Пожалуйста, примите политику конфиденциальности.', 'warning');
            return;
        }

        if (!area || area <= 0) {
            calcValue.textContent = 'Укажите значение';
            return;
        }

        let price, productName, unitLabel;
        if (type === 'paving') {
            price = parseInt(pavingSelect.value) * area;
            productName = pavingSelect.options[pavingSelect.selectedIndex].text;
            unitLabel = 'м²';
        } else {
            price = parseInt(borderSelect.value) * area;
            productName = borderSelect.options[borderSelect.selectedIndex].text;
            unitLabel = 'шт';
        }

        const formattedPrice = price.toLocaleString('ru-RU') + ' ₽';
        calcValue.textContent = formattedPrice;
        calcValue.style.animation = 'none';
        calcValue.offsetHeight;
        calcValue.style.animation = 'fadeIn 0.4s ease';

        // Save calculation to server
        const calcData = {
            type: type === 'paving' ? 'Брусчатка' : 'Бордюры',
            product: productName,
            quantity: area,
            unit: unitLabel,
            total: formattedPrice,
            client_name: calcNameInput.value.trim(),
            client_phone: calcPhoneInput.value.trim()
        };

        fetch('/api/calculations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(calcData)
        }).catch(() => {});

        // Show submitted message if contact info provided
        if (calcData.client_name || calcData.client_phone) {
            const existing = document.querySelector('.calc__submitted');
            if (existing) existing.remove();
            const msg = document.createElement('div');
            msg.className = 'calc__submitted';
            msg.textContent = '✓ Расчёт сохранён. Мы свяжемся с вами!';
            calcBtn.parentElement.appendChild(msg);
            setTimeout(() => msg.remove(), 4000);
        }
    });

    // ===== CATALOG TABS =====
    const tabs = document.querySelectorAll('.catalog__tab');
    const tabContents = document.querySelectorAll('.catalog__content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        });
    });

    // ===== REVIEWS SLIDER =====
    const track = document.getElementById('reviewsTrack');
    const prevBtn = document.getElementById('reviewPrev');
    const nextBtn = document.getElementById('reviewNext');
    let reviewIndex = 0;

    function getCardsPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function updateSlider() {
        const cards = track.querySelectorAll('.review-card');
        const perView = getCardsPerView();
        const maxIndex = Math.max(0, cards.length - perView);
        reviewIndex = Math.min(reviewIndex, maxIndex);

        const card = cards[0];
        if (!card) return;
        const cardWidth = card.offsetWidth + 24;
        track.style.transform = `translateX(-${reviewIndex * cardWidth}px)`;
    }

    prevBtn.addEventListener('click', () => {
        if (reviewIndex > 0) {
            reviewIndex--;
            updateSlider();
        }
    });

    nextBtn.addEventListener('click', () => {
        const cards = track.querySelectorAll('.review-card');
        const perView = getCardsPerView();
        if (reviewIndex < cards.length - perView) {
            reviewIndex++;
            updateSlider();
        }
    });

    window.addEventListener('resize', updateSlider);

    // Touch swipe for reviews slider
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    track.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = false;
    }, { passive: true });

    track.addEventListener('touchmove', e => {
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (!isSwiping && dx > dy && dx > 8) {
            isSwiping = true;
        }
    }, { passive: true });

    track.addEventListener('touchend', e => {
        if (!isSwiping) return;
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            const cards = track.querySelectorAll('.review-card');
            const perView = getCardsPerView();
            if (diff > 0 && reviewIndex < cards.length - perView) {
                reviewIndex++;
                updateSlider();
            } else if (diff < 0 && reviewIndex > 0) {
                reviewIndex--;
                updateSlider();
            }
        }
    }, { passive: true });

    // ===== REVIEW FORM =====
    const starsInput = document.getElementById('starsInput');
    const starBtns = starsInput.querySelectorAll('.star-btn');
    let selectedRating = 0;

    starBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedRating = parseInt(btn.dataset.value);
            starBtns.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
            });
        });

        btn.addEventListener('mouseenter', () => {
            const hoverVal = parseInt(btn.dataset.value);
            starBtns.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.value) <= hoverVal);
            });
        });
    });

    starsInput.addEventListener('mouseleave', () => {
        starBtns.forEach(s => {
            s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
        });
    });

    // Review photo upload
    let reviewPhotos = [];
    const reviewPhotoInput = document.getElementById('reviewPhotoInput');
    const reviewPhotosUpload = document.getElementById('reviewPhotosUpload');
    const reviewPhotoAdd = document.getElementById('reviewPhotoAdd');

    reviewPhotoAdd.addEventListener('click', () => reviewPhotoInput.click());

    reviewPhotoInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                reviewPhotos.push(ev.target.result);
                renderReviewPhotoPreviews();
            };
            reader.readAsDataURL(file);
        });
        reviewPhotoInput.value = '';
    });

    function renderReviewPhotoPreviews() {
        const existing = reviewPhotosUpload.querySelectorAll('.review-form__photo-thumb');
        existing.forEach(el => el.remove());

        reviewPhotos.forEach((src, idx) => {
            const thumb = document.createElement('div');
            thumb.className = 'review-form__photo-thumb';
            thumb.innerHTML = '<img src="' + escapeHtml(src) + '" alt=""><button type="button" class="review-form__photo-remove">&times;</button>';
            thumb.querySelector('.review-form__photo-remove').addEventListener('click', () => {
                reviewPhotos.splice(idx, 1);
                renderReviewPhotoPreviews();
            });
            reviewPhotosUpload.insertBefore(thumb, reviewPhotoAdd);
        });

        // no limit on photo count
    }

    const submitReview = document.getElementById('submitReview');
    const reviewName = document.getElementById('reviewName');
    const reviewCity = document.getElementById('reviewCity');
    const reviewText = document.getElementById('reviewText');
    const reviewSuccess = document.getElementById('reviewSuccess');
    const reviewFormFields = document.querySelector('.review-form__fields');

    submitReview.addEventListener('click', () => {
        const name = reviewName.value.trim();
        const text = reviewText.value.trim();
        const city = reviewCity.value.trim();

        if (!document.getElementById('reviewConsent').checked) {
            showToast('Пожалуйста, примите политику конфиденциальности.', 'warning');
            return;
        }

        if (!name || !text || selectedRating === 0) {
            showToast('Пожалуйста, заполните все поля и поставьте оценку.', 'warning');
            return;
        }

        fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, text, rating: selectedRating, city, photos: JSON.stringify(reviewPhotos) })
        })
        .then(r => r.json())
        .then(() => {
            reviewFormFields.classList.add('hidden');
            reviewSuccess.classList.remove('hidden');

            setTimeout(() => {
                reviewFormFields.classList.remove('hidden');
                reviewSuccess.classList.add('hidden');
                reviewName.value = '';
                reviewCity.value = '';
                reviewText.value = '';
                selectedRating = 0;
                reviewPhotos = [];
                renderReviewPhotoPreviews();
                starBtns.forEach(s => s.classList.remove('active'));
            }, 3000);
        })
        .catch(() => showToast('Ошибка при отправке отзыва', 'error'));
    });

    // Load approved reviews from server
    function loadApprovedReviews() {
        fetch('/api/reviews?status=approved')
            .then(r => r.json())
            .then(approved => {
                track.innerHTML = '';
                approved.forEach(review => {
                    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                    const initials = review.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                    const card = document.createElement('div');
                    card.className = 'review-card';

                    let photosHtml = '';
                    try {
                        const ph = JSON.parse(review.photos || '[]');
                        if (ph.length) {
                            photosHtml = '<div class="review-card__photos">' +
                                ph.map(u => '<img src="' + escapeHtml(u) + '" alt="" class="review-card__photo" onclick="openPhotoLightbox(this.src)">').join('') +
                                '</div>';
                        }
                    } catch(e) {}

                    card.innerHTML = `
                        <div class="review-card__stars">${stars}</div>
                        <p class="review-card__text">${escapeHtml(review.text)}</p>
                        ${photosHtml}
                        <div class="review-card__author">
                            <div class="review-card__avatar">${escapeHtml(initials)}</div>
                            <div>
                                <p class="review-card__name">${escapeHtml(review.name)}</p>
                                <p class="review-card__date">${review.city ? '📍 ' + escapeHtml(review.city) + ' · ' : ''}${escapeHtml(review.date)}</p>
                            </div>
                        </div>
                    `;
                    track.appendChild(card);
                });
                updateSlider();
            })
            .catch(() => {});
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadApprovedReviews();

    // ===== HELPER: FORMAT PRICE =====
    function formatPrice(price, unit) {
        if (!price) return '';
        if (/₽/.test(price)) return price;
        return price + ' ' + (unit || '₽/м²');
    }

    // ===== LOAD PRODUCTS FROM SERVER INTO CATALOG + POPULAR =====
    function loadProducts() {
        const pavingGrid = document.querySelector('#tab-paving .catalog__grid');
        const bordersGrid = document.querySelector('#tab-borders .catalog__grid');
        const popularGrid = document.getElementById('popularGrid');
        if (!pavingGrid || !bordersGrid) return;

        fetch('/api/products')
            .then(r => r.json())
            .then(products => {
                pavingGrid.innerHTML = '';
                bordersGrid.innerHTML = '';
                if (popularGrid) popularGrid.innerHTML = '';

                products.forEach((p, index) => {
                    const productData = {
                        name: p.name,
                        type: p.type,
                        specs: p.specs || '',
                        color: p.colors || '',
                        price: formatPrice(p.price, p.price_unit),
                        desc: p.description || '',
                        colors: p.colors || '',
                        bg: p.bg || '#c4a882',
                        variations: p.variations || '[]',
                        badge: p.badge || '',
                        photos: p.photos || '[]',
                        price_unit: p.price_unit || '₽/м²'
                    };
                    if (p.photo) productData.photo = p.photo;

                    const badgeClassMap = {'Новинка':'catalog-card__badge--new','Хит':'catalog-card__badge--hit','Акция':'catalog-card__badge--sale','Распродажа':'catalog-card__badge--promo'};
                    const badgeHtml = p.badge ? '<span class="catalog-card__badge ' + (badgeClassMap[p.badge] || '') + '">' + escapeHtml(p.badge) + '</span>' : '';

                    // Catalog card
                    const card = document.createElement('div');
                    card.className = 'catalog-card';
                    card.setAttribute('data-product', JSON.stringify(productData));

                    const imgStyle = p.photo
                        ? 'background: none;'
                        : 'background: linear-gradient(135deg, ' + escapeHtml(p.bg || '#c4a882') + ', ' + escapeHtml(p.bg || '#c4a882') + 'dd);';
                    const imgContent = p.photo
                        ? '<img src="' + escapeHtml(p.photo) + '" alt="" style="width:100%;height:100%;object-fit:cover;">'
                        : '';

                    card.innerHTML = `
                        <div class="catalog-card__img" style="${imgStyle}">
                            ${imgContent}
                            ${badgeHtml}
                        </div>
                        <h3 class="catalog-card__name">${escapeHtml(p.name)}</h3>
                        <p class="catalog-card__desc">${escapeHtml(p.description || '')}</p>
                        <p class="catalog-card__specs">${escapeHtml(p.specs || '')}</p>
                        <p class="catalog-card__colors">Цвета: ${escapeHtml(p.colors || '—')}</p>
                        <p class="catalog-card__price">${escapeHtml(formatPrice(p.price, p.price_unit))}</p>
                    `;

                    card.addEventListener('click', (e) => {
                        if (e.target.closest('a')) return;
                        openModal(productData);
                    });

                    if (p.type === 'Бордюр') {
                        bordersGrid.appendChild(card);
                    } else {
                        pavingGrid.appendChild(card);
                    }

                    // Popular card (only products marked as popular)
                    if (popularGrid && p.is_popular) {
                        const popCard = document.createElement('div');
                        popCard.className = 'product-card';
                        popCard.setAttribute('data-product', JSON.stringify(productData));

                        const popImgStyle = p.photo
                            ? 'background: none;'
                            : 'background-color: ' + escapeHtml(p.bg || '#c4a882') + ';';
                        const popImgContent = p.photo
                            ? '<img src="' + escapeHtml(p.photo) + '" alt="" style="width:100%;height:100%;object-fit:cover;">'
                            : '';

                        popCard.innerHTML = `
                            <div class="product-card__img" style="${popImgStyle}">
                                ${popImgContent}
                                ${badgeHtml ? badgeHtml.replace('catalog-card__badge', 'product-card__badge-tag') : ''}
                            </div>
                            <div class="product-card__body">
                                <h3 class="product-card__name">${escapeHtml(p.name)}</h3>
                                <p class="product-card__info">${escapeHtml(p.specs || '')} · ${escapeHtml(p.colors || '')}</p>
                                <div class="product-card__footer">
                                    <span class="product-card__price">${escapeHtml(formatPrice(p.price, p.price_unit))}</span>
                                    <a href="#calculator" class="product-card__btn" onclick="event.stopPropagation()">Рассчитать</a>
                                </div>
                            </div>
                        `;

                        popCard.addEventListener('click', (e) => {
                            if (e.target.closest('a')) return;
                            openModal(productData);
                        });

                        popularGrid.appendChild(popCard);
                    }
                });
            })
            .catch(() => {});
    }

    loadProducts();

    // ===== LOAD PRICE LIST FROM API =====
    function loadPricelist() {
        const container = document.getElementById('pricelistContainer');
        if (!container) return;

        fetch('/api/services')
            .then(r => r.json())
            .then(services => {
                // Remove old rows (keep header)
                container.querySelectorAll('.pricelist__row:not(.pricelist__row--header)').forEach(r => r.remove());

                if (services.length === 0) {
                    container.style.display = 'none';
                    return;
                }
                container.style.display = '';

                services.forEach(s => {
                    const row = document.createElement('div');
                    row.className = 'pricelist__row';
                    row.innerHTML = '<span>' + escapeHtml(s.name) + '</span><span class="pricelist__price">' + escapeHtml(s.price) + '</span>';
                    container.appendChild(row);
                });
            })
            .catch(() => {});
    }

    loadPricelist();

    // ===== FAQ =====
    const faqItems = document.querySelectorAll('.faq__item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq__question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ===== SCROLL ANIMATIONS =====
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.product-card, .catalog-card, .service-card, .review-card, .faq__item, .contacts__item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ===== PHOTO LIGHTBOX =====
function openPhotoLightbox(src) {
    const lb = document.getElementById('photoLightbox');
    document.getElementById('lightboxImg').src = src;
    lb.classList.add('photo-lightbox--active');
    document.body.style.overflow = 'hidden';
}
function closePhotoLightbox() {
    const lb = document.getElementById('photoLightbox');
    lb.classList.remove('photo-lightbox--active');
    document.body.style.overflow = '';
}

// ===== CONTACT CHOICE POPUP =====
function openContactChoice() {
    document.getElementById('contactChoice').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeContactChoice() {
    document.getElementById('contactChoice').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type) {
    type = type || 'warning';
    var container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    var icons = { warning: '⚠️', error: '❌', success: '✅', info: 'ℹ️' };
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.innerHTML = '<span class="toast__icon">' + (icons[type] || icons.warning) + '</span>' +
        '<span class="toast__text">' + message + '</span>' +
        '<button class="toast__close" onclick="this.parentElement.remove()">&times;</button>';
    container.appendChild(toast);
    requestAnimationFrame(function() { toast.classList.add('toast--visible'); });
    setTimeout(function() {
        toast.classList.remove('toast--visible');
        toast.classList.add('toast--hiding');
        setTimeout(function() { toast.remove(); }, 400);
    }, 4000);
}
