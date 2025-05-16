document.addEventListener('DOMContentLoaded', function() {
    // Переменные для хранения данных
    let categories = [];
    let types = [];
    let products = [];

    // Загрузка JSON-данных
    async function loadData() {
        try {
            const [catResponse, typeResponse, prodResponse] = await Promise.all([
                fetch('assets/meta/category.json'),
                fetch('assets/meta/type.json'),
                fetch('assets/meta/product.json')
            ]);
            categories = await catResponse.json();
            types = await typeResponse.json();
            products = await prodResponse.json();
            initializePage();
        } catch (error) {
            console.error('Ошибка загрузки JSON:', error);
        }
    }

    // Определение текущей страницы и вызов соответствующей функции
    function initializePage() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        if (path === 'index.html') {
            renderIndexCatalog();
        } else if (path === 'catalog.html') {
            renderCatalogPage();
        } else if (path === 'category.html') {
            renderCategoryPage();
        } else if (path === 'product.html') {
            renderProductPage();
        }
    }

    // Рендеринг каталога для index.html
    function renderIndexCatalog() {
        const categoryList = document.querySelector('.catalog_main__sec .category__list');
        if (!categoryList) return;

        categoryList.innerHTML = ''; // Очищаем секцию
        categories.forEach(category => {
            const categoryLi= document.createElement('li');
            categoryLi.innerHTML = `
                <a href="category.html?category=${category.id}" class="card">
                    <div class="card__img">
                        <img src="${category.image_link}" alt="${category.title}">
                    </div>
                    <h3>${category.title}</h3>
                </a>
            `;
            categoryList.appendChild(categoryLi);
        });
    }

    // Рендеринг каталога для catalog.html
    function renderCatalogPage() {
        const catalogSection = document.querySelector('.catalog__list');
        if (!catalogSection) return;

        catalogSection.innerHTML = ''; // Очищаем секцию
        categories.forEach(category => {
            const categoryDiv = document.createElement('li');
            categoryDiv.classList.add("card");
            categoryDiv.classList.add('category__card_type');
            categoryDiv.innerHTML = `
                <div class="row">
                    <img src="${category.image_link}" alt="${category.title}">
                    <div class="column">
                        <h2><a href="category.html?category=${category.id}">${category.title}</a></h2>
                        <nav>
                            ${types
                                .filter(type => type.id_category === category.id)
                                .map(type => `<a href="category.html?category=${category.id}&type=${type.id}">${type.title}</a>`)
                                .join('')
                            }
                        </nav>
                    </div>
                </div>
            `;
            catalogSection.appendChild(categoryDiv);
        });
    }

    // Рендеринг страницы категории
    function renderCategoryPage() {
        const params = new URLSearchParams(window.location.search);
        const categoryId = parseInt(params.get('category'));
        const typeId = parseInt(params.get('type'));

        const categorySection = document.querySelector('section');
        if (!categorySection) return;

        const category = categories.find(c => c.id === categoryId);
        if (!category) {
            categorySection.innerHTML = '<p>Категория не найдена</p>';
            return;
        }

        // Обновляем заголовок и описание
        const titleElement = categorySection.querySelector('h2.title__category');
        const descriptionElement = categorySection.querySelector('article');
        if (titleElement) titleElement.textContent = category.title;
        if (descriptionElement) descriptionElement.textContent = category.description;

        // Находим существующий список типов
        const typeList = categorySection.querySelector('nav.category__nav');
        if (typeList) {
            typeList.innerHTML = ''; // Очищаем текущий список
            types
                .filter(type => type.id_category === categoryId)
                .forEach(type => {
                    typeList.innerHTML += `<a class="btn btn__big btn__border ${type.id === typeId ? 'active' : ''}" href="category.html?category=${categoryId}&type=${type.id}" ${type.id === typeId ? 'class="active"' : ''}>${type.title}</a>`;
                });
        }

        // Находим все карточки продуктов и очищаем их
        const productCards = categorySection.querySelectorAll('.card.product__card');
        productCards.forEach(card => card.parentElement.remove()); // Удаляем существующие карточки

        // Создаем контейнер для новых продуктов
        const productsContainer = document.querySelector('ul.product__list');

        // Фильтруем продукты
        const filteredProducts = typeId
            ? products.filter(p => p.id_category === categoryId && p.id_type === typeId)
            : products.filter(p => p.id_category === categoryId);

        // Рендеринг продуктов
        filteredProducts.forEach(product => {
            const productDiv = document.createElement('li');
            productDiv.innerHTML = `
                <a data-product="${product.id}" href="product.html?id=${product.id}" class="card product__card" data-favorit="false">
                    <span class="favorit__btn">
                        <svg width="20.000000" height="17.500000" viewBox="0 0 20 17.5" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <desc>
                                    Created with Pixso.
                            </desc>
                            <defs/>
                            <path id="Vector" d="M15 0C15 0 11.25 0 10 4.03C8.75 0 5 0 5 0C2.25 0 0 2.42 0 5.38C0 10.9 10 17.5 10 17.5C10 17.5 20 10.76 20 5.38C20 2.42 17.75 0 15 0Z" fill="#EFEFEF" fill-opacity="1.000000" fill-rule="evenodd"/>
                        </svg>
                    </span>    
                    <img src="${product.image_link}" alt="${product.title}">
                    <p class="brend">${product.fabricator}</p>
                    <h3 class="product__code">${product.code}</h3>
                    <p class="product__title">${product.title}</p>
                    <p class="price"><span>${product.price}</span> ₽/шт</p>
                    <div class="row">
                        <div class="counter__block">
                            <button class="counter__item decrement">-</button>
                            <input type="text" value="1" class="counter__input">
                            <button class="counter__item increment">+</button>
                        </div>
                        <button class="btn" data-target="add_product__basket">В корзину</button>
                    </div>
                </a>
            `;
            productsContainer.appendChild(productDiv);
        });

        // Вставляем продукты после списка типов
        // if (typeList) {
        //     typeList.parentElement.insertAdjacentElement('afterend', productsContainer);
        // } else {
        //     categorySection.appendChild(productsContainer);
        // }
    }

    // Рендеринг страницы товара
    function renderProductPage() {
        const params = new URLSearchParams(window.location.search);
        const productId = parseInt(params.get('id'));

        const productSection = document.querySelector('.product_item__sec');
        if (!productSection) return;

        const product = products.find(p => p.id === productId);
        if (!product) {
            productSection.innerHTML = '<p>Товар не найден</p>';
            return;
        }

        const category = categories.find(c => c.id === product.id_category);
        const type = types.find(t => t.id === product.id_type);

        productSection.innerHTML = `
            <div class="container">
                <h2 class="main__title product__code">${product.code}</h2>
                <div class="main__info">
                    <div class="img__block">
                        <img src="${product.image_link}" alt="${product.title}">
                        <p class="img__text">* Изображения носят ознакомительный характер, внешний вид товара может отличаться.</p>
                    </div>
                    <div class="text__block">
                        <h3 class="product__title">${product.title}</h3>
                        <div class="row">
                            <p class="price"><span>${product.price}</span>₽/шт</p>
                            <span class="favorit__btn">
                                <svg width="20.000000" height="17.500000" viewBox="0 0 20 17.5" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                    <desc>
                                            Created with Pixso.
                                    </desc>
                                    <defs/>
                                    <path id="Vector" d="M15 0C15 0 11.25 0 10 4.03C8.75 0 5 0 5 0C2.25 0 0 2.42 0 5.38C0 10.9 10 17.5 10 17.5C10 17.5 20 10.76 20 5.38C20 2.42 17.75 0 15 0Z" fill="#EFEFEF" fill-opacity="1.000000" fill-rule="evenodd"/>
                                </svg>
                            </span>
                        </div>
                        <div class="row">
                            <div class="counter__block">
                                <button class="counter__item decrement">-</button>
                                <input type="text" value="1" class="counter__input">
                                <button class="counter__item increment">+</button>
                            </div>
                            <button class="btn btn__big" data-target="add_product__basket">В корзину</button>
                        </div>
                        <ul class="property__list">
                            <li><p class="title">Производитель</p><span class="line"></span><p class="value">${product.fabricator}</p></li>
                            <li><p class="title">Страна бренда</p><span class="line"></span><p class="value">${product.country}</p></li>
                            <li><p class="title">Срок гарантии, мес</p><span class="line"></span><p class="value">${product.garant}</p></li>
                            <li><p class="title">Категория</p><span class="line"></span><p class="value">${category ? category.title : 'Неизвестно'}</p></li>
                            <li><p class="title">Тип</p><span class="line"></span><p class="value">${type ? type.title : 'Неизвестно'}</p></li>
                        </ul>
                        <div class="document__block">
                            <p>Документы</p>
                            <ul class="document__list">
                                <li>
                                    <a href="${product.document_link}" download="">
                                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="40px" width="40px" version="1.1" id="Layer_1" viewBox="0 0 512 512" xml:space="preserve">
                                            <path style="fill:#E2E5E7;" d="M128,0c-17.6,0-32,14.4-32,32v448c0,17.6,14.4,32,32,32h320c17.6,0,32-14.4,32-32V128L352,0H128z"/>
                                            <path style="fill:#B0B7BD;" d="M384,128h96L352,0v96C352,113.6,366.4,128,384,128z"/>
                                            <polygon style="fill:#CAD1D8;" points="480,224 384,128 480,128 "/>
                                            <path style="fill:#F15642;" d="M416,416c0,8.8-7.2,16-16,16H48c-8.8,0-16-7.2-16-16V256c0-8.8,7.2-16,16-16h352c8.8,0,16,7.2,16,16  V416z"/>
                                            <g>
                                                <path style="fill:#FFFFFF;" d="M101.744,303.152c0-4.224,3.328-8.832,8.688-8.832h29.552c16.64,0,31.616,11.136,31.616,32.48   c0,20.224-14.976,31.488-31.616,31.488h-21.36v16.896c0,5.632-3.584,8.816-8.192,8.816c-4.224,0-8.688-3.184-8.688-8.816V303.152z    M118.624,310.432v31.872h21.36c8.576,0,15.36-7.568,15.36-15.504c0-8.944-6.784-16.368-15.36-16.368H118.624z"/>
                                                <path style="fill:#FFFFFF;" d="M196.656,384c-4.224,0-8.832-2.304-8.832-7.92v-72.672c0-4.592,4.608-7.936,8.832-7.936h29.296   c58.464,0,57.184,88.528,1.152,88.528H196.656z M204.72,311.088V368.4h21.232c34.544,0,36.08-57.312,0-57.312H204.72z"/>
                                                <path style="fill:#FFFFFF;" d="M303.872,312.112v20.336h32.624c4.608,0,9.216,4.608,9.216,9.072c0,4.224-4.608,7.68-9.216,7.68   h-32.624v26.864c0,4.48-3.184,7.92-7.664,7.92c-5.632,0-9.072-3.44-9.072-7.92v-72.672c0-4.592,3.456-7.936,9.072-7.936h44.912   c5.632,0,8.96,3.344,8.96,7.936c0,4.096-3.328,8.704-8.96,8.704h-37.248V312.112z"/>
                                            </g>
                                            <path style="fill:#CAD1D8;" d="M400,432H96v16h304c8.8,0,16-7.2,16-16v-16C416,424.8,408.8,432,400,432z"/>
                                        </svg> PDF файл
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Существующая функциональность
    const fileInputs = document.querySelectorAll('.custom__input_file');
    fileInputs.forEach(inputContainer => {
        const fileInput = inputContainer.querySelector('input[type="file"]');
        const preloadContainer = inputContainer.querySelector('.img__preload');
        fileInput.addEventListener('change', function(event) {
            preloadContainer.innerHTML = '';
            const files = event.target.files;
            Array.from(files).forEach(file => {
                if (!file.type.match('image.*')) return;
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '100px';
                    img.style.maxHeight = '100px';
                    img.style.margin = '5px';
                    img.style.borderRadius = '5px';
                    img.style.objectFit = 'cover';
                    const imgWrapper = document.createElement('div');
                    imgWrapper.style.display = 'inline-block';
                    imgWrapper.style.position = 'relative';
                    const removeBtn = document.createElement('button');
                    removeBtn.innerHTML = '×';
                    removeBtn.style.position = 'absolute';
                    removeBtn.style.top = '0';
                    removeBtn.style.right = '0';
                    removeBtn.style.background = 'rgba(255, 0, 0, 0.7)';
                    removeBtn.style.color = 'white';
                    removeBtn.style.border = 'none';
                    removeBtn.style.borderRadius = '50%';
                    removeBtn.style.width = '20px';
                    removeBtn.style.height = '20px';
                    removeBtn.style.cursor = 'pointer';
                    removeBtn.style.display = 'flex';
                    removeBtn.style.alignItems = 'center';
                    removeBtn.style.alignItems = 'center';
                    removeBtn.style.justifyContent = 'center';
                    removeBtn.addEventListener('click', function() {
                        imgWrapper.remove();
                        if (preloadContainer.children.length === 0) {
                            fileInput.value = '';
                        }
                    });
                    imgWrapper.appendChild(img);
                    imgWrapper.appendChild(removeBtn);
                    preloadContainer.appendChild(imgWrapper);
                };
                reader.readAsDataURL(file);
            });
        });
    });

    const selectContainers = document.querySelectorAll('.custom__select');
    selectContainers.forEach(container => {
        const nativeSelect = container.querySelector('select');
        const options = nativeSelect.querySelectorAll('option');
        const customSelect = document.createElement('div');
        customSelect.className = 'custom-select-wrapper';
        const selectedOption = document.createElement('div');
        selectedOption.className = 'selected-option';
        const triangle = document.createElement('div');
        triangle.className = 'select-triangle';
        triangle.innerHTML = '▼';
        const dropdown = document.createElement('div');
        dropdown.className = 'custom-dropdown';
        selectedOption.textContent = nativeSelect.options[nativeSelect.selectedIndex].text;
        selectedOption.appendChild(triangle);
        options.forEach(option => {
            const dropdownItem = document.createElement('div');
            dropdownItem.className = 'dropdown-item';
            dropdownItem.textContent = option.text;
            dropdownItem.addEventListener('click', () => {
                nativeSelect.value = option.value;
                selectedOption.textContent = option.text;
                selectedOption.appendChild(triangle);
                dropdown.style.display = 'none';
                triangle.classList.remove('open');
                nativeSelect.dispatchEvent(new Event('change'));
            });
            dropdown.appendChild(dropdownItem);
        });
        selectedOption.addEventListener('click', () => {
            const isOpen = dropdown.style.display === 'block';
            dropdown.style.display = isOpen ? 'none' : 'block';
            triangle.classList.toggle('open', !isOpen);
        });
        document.addEventListener('click', (e) => {
            if (!customSelect.contains(e.target)) {
                dropdown.style.display = 'none';
                triangle.classList.remove('open');
            }
        });
        nativeSelect.style.display = 'none';
        customSelect.appendChild(selectedOption);
        customSelect.appendChild(dropdown);
        container.appendChild(customSelect);
    });

    document.body.addEventListener('click', (event) => {
        const target = event.target;
        if (target.matches('.btn[data-target="add_product__basket"]')) {
            event.preventDefault();
            const card = target.closest('.card');
            const productName = card.querySelector('.product__title').textContent;
            const productPrice = card.querySelector('.price span').textContent;
            const quantityInput = card.querySelector('.counter__input');
            const quantity = parseInt(quantityInput.value, 10);
            console.log(`Добавлен товар: ${productName}, цена: ${productPrice} ₽, количество: ${quantity}`);
        }
        if (target.matches('.counter__item.increment')) {
            event.preventDefault();
            const input = target.closest('.counter__block').querySelector('.counter__input');
            let value = parseInt(input.value, 10);
            input.value = value + 1;
            updateBasketInfo();
        }
        if (target.matches('.counter__item.decrement')) {
            event.preventDefault();
            const input = target.closest('.counter__block').querySelector('.counter__input');
            let value = parseInt(input.value, 10);
            if (value > 1) {
                input.value = value - 1;
            }
            updateBasketInfo();
        }
        if (target.matches('.counter__input')) {
            event.preventDefault();
        }
        if (target.closest('.del__product_basket')) {
            event.preventDefault();
            const productItem = target.closest('li[data-product-basket]');
            if (productItem) {
                productItem.remove();
                updateBasketInfo();
            }
        }
    });

    document.body.addEventListener('focusout', (event) => {
        const target = event.target;
        if (target.matches('.counter__input')) {
            handleInputValue(target);
            updateBasketInfo();
        }
    });

    document.body.addEventListener('keypress', (event) => {
        const target = event.target;
        if (target.matches('.counter__input') && event.key === 'Enter') {
            event.preventDefault();
            handleInputValue(target);
            updateBasketInfo();
        }
    });

    const accordions = document.querySelectorAll(".acardion");
    accordions.forEach((accordion) => {
        accordion.addEventListener("click", () => {
            accordions.forEach((item) => {
                if (item !== accordion) {
                    item.classList.remove("focus");
                }
            });
            accordion.classList.toggle("focus");
        });
    });

    const radioInputs = document.querySelectorAll('input[type="radio"]');
    radioInputs.forEach((input) => {
        input.addEventListener("change", () => {
            const groupName = input.name;
            document.querySelectorAll(`input[name="${groupName}"]`)
                .forEach((groupInput) => {
                    const label = document.querySelector(`label[for="${groupInput.id}"]`);
                    if (groupInput.checked) {
                        label.classList.add("active");
                    } else {
                        label.classList.remove("active");
                    }
                });
        });
    });

    radioInputs.forEach((input) => {
        if (input.checked) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            label.classList.add("active");
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target.getAttribute("data-popup") != null) {
            document.querySelector(`.popup[data-popup='${e.target.getAttribute("data-popup")}']`).classList.add('active');
        }
        if (e.target.classList.contains('over')) {
            var obj = e.target;
            obj.parentElement.classList.remove('active');
        }
    });

    function updateBasketInfo() {
        const basketItems = document.querySelectorAll('.basket__product>li');
        let totalSum = 0;
        let totalQuantity = 0;
        basketItems.forEach((item) => {
            const priceText = item.querySelector('.product__price').textContent;
            const price = parseFloat(priceText.replace(/[^\d.-]/g, ''));
            const quantityInput = item.querySelector('.counter__input');
            const quantity = parseInt(quantityInput.value, 10);
            totalSum += price * quantity;
            totalQuantity += quantity;
        });
        const totalSumElement = document.querySelector('.basket__info .summa:first-child span');
        const totalQuantityElement = document.querySelector('.basket__info .summa:last-child span');
        totalSumElement.textContent = `${totalSum.toFixed(2)} ₽`;
        totalQuantityElement.textContent = `${totalQuantity} шт`;
    }

    function handleInputValue(input) {
        let value = input.value.trim();
        value = value.replace(/[^0-9]/g, '');
        if (!value || parseInt(value, 10) <= 0) {
            value = 1;
        }
        input.value = value;
    }

    // Запуск загрузки данных
    loadData();
});