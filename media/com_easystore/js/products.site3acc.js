/**
 * @copyright   Copyright (C) 2020 JoomShaper. All rights reserved.
 * @license     GNU General Public License version 3; see LICENSE
 * @since      1.0.0
 */

Joomla = window.Joomla || {};

((Joomla, document) => {
	function generateUrlString(url, searchParams) {
		const searchString = searchParams.size ? `?${searchParams.toString()}` : '';
		return `${url.pathname}${searchString}`;
	}

	const onChange = (event) => {
		event.preventDefault();

		const easystoreFilterBy = event.target.closest('.easystore-product-filter');
		const url = new URL(window.location);
		const searchParams = new URLSearchParams(window.location.search);
		const sortByElement = event.target.closest('[easystore-sort-by]');

		if (sortByElement) {
			const selectedValue = event.target.value;
			const fieldName = event.target.name;
			searchParams.set(fieldName, selectedValue);
			window.location.href = generateUrlString(url, searchParams);
			return;
		}

		if (easystoreFilterBy) {
			const checkboxWrapper = event.target.closest('[data-easystore-filter-by]');

			if (checkboxWrapper) {
				const filterBy = checkboxWrapper.dataset['easystoreFilterBy'];
				const elementsOfSameFilter = document.querySelectorAll(`[data-easystore-filter-by="${filterBy}"]`);
				const checkedItems = [];

				elementsOfSameFilter.forEach((element) => {
					const checkboxCheckedElements = element.querySelectorAll('input[type="checkbox"]:checked');
					const radioCheckedElements = element.querySelectorAll('input[type="radio"]:checked');

					if (checkboxCheckedElements.length) {
						checkedItems.push(...checkboxCheckedElements);
					}

					if (radioCheckedElements.length) {
						checkedItems.push(...radioCheckedElements);
					}
				});

				if (checkedItems.length) {
					const checkedItemsString = [...checkedItems]
						.reduce((arr, checkedItem) => [...arr, checkedItem.value], [])
						.join(',');
					searchParams.set(filterBy, checkedItemsString);
				} else {
					searchParams.delete(filterBy);
				}

				window.location.href = generateUrlString(url, searchParams);
				return;
			}
		}
	};

	const onClick = (event) => {
		// Filter Reset
		const filterReset = event.target.closest('[easystore-filter-reset]');
		const filterBy = event.target.closest('[data-easystore-filter-by]')?.dataset['easystoreFilterBy'] ?? '';

		if (filterReset) {
			const isCheckbox = filterReset.parentElement.querySelectorAll('input[type="checkbox"]')?.length ?? 0;
			const checkedItems = filterReset.parentElement.querySelectorAll('input[type="checkbox"]:checked');
			if (isCheckbox) {
				if (checkedItems.length) {
					if (filterBy) {
						checkedItems.forEach((checkedItem) => (checkedItem.checked = false));
						const url = new URL(window.location);
						const searchParams = new URLSearchParams(window.location.search);

						if (filterBy === 'filter_variants') {
							const values = url.searchParams.get(filterBy)?.split(',');
							const checkedValues = new Set([...checkedItems].map((checkedItem) => checkedItem.value));
							const filteredValues = values.filter((value) => !checkedValues.has(value));
							if (filteredValues.length) {
								searchParams.set(filterBy, filteredValues.join(','));
							} else {
								searchParams.delete(filterBy);
							}
						} else {
							searchParams.delete(filterBy);
						}

						window.location.href = generateUrlString(url, searchParams);
						return;
					}
				}
			} else {
				const url = new URL(window.location);
				const searchParams = new URLSearchParams(window.location.search);

				if (filterBy) {
					searchParams.delete(filterBy);
					window.location.href = generateUrlString(url, searchParams);
					return;
				}
			}
		}
	};

	const onLoad = () => {
		function displayResetSelector(filterBySelector) {
			const resetSelector = filterBySelector.querySelector('[easystore-filter-reset]');
			resetSelector.style.display = 'block';
		}

		const urlParams = new URLSearchParams(window.location.search);
		const keys = [...urlParams.keys()];
		for (let key of keys) {
			if (key === 'filter_variants') {
				const values = urlParams.get(key).split(',');
				for (let value of values) {
					const selectedField = document.querySelector(`input[value="${value}"]`);
					if (selectedField) {
						const filterBySelector = selectedField.closest('.easystore-product-filter');
						if (filterBySelector) {
							displayResetSelector(filterBySelector);
						}
					}
				}
			} else {
				const filterBySelector = document.querySelector(`[data-easystore-filter-by="${key}"]`);
				if (filterBySelector) {
					displayResetSelector(filterBySelector);
				}
			}
		}
	};

	const onBoot = () => {
		document.addEventListener('change', onChange);
		document.addEventListener('click', onClick);
		window.addEventListener('load', onLoad);
	};
	document.addEventListener('DOMContentLoaded', onBoot);
})(Joomla, document);

Joomla.unveil = function (threshold = 0, callback = null) {
	let images = [...document.querySelectorAll('[loading=lazy]')];
	let loaded;

	function setSource(element) {
		const source = element.getAttribute('data-src');
		if (source) {
			element.setAttribute('src', source);
			if (typeof callback === 'function') {
				callback.call(element);
			}
		}
	}

	images.forEach((img) => {
		img.addEventListener(
			'unveil',
			function () {
				setSource(this);
			},
			{ once: true },
		);
	});

	function checkInView() {
		const top = window.scrollY;
		const bottom = top + window.innerHeight;

		const inView = images.filter((el) => {
			const rect = el.getBoundingClientRect();
			const et = rect.top + top;
			const eb = et + rect.height;
			return eb >= top - threshold && et <= bottom + threshold;
		});

		loaded = inView;

		loaded.forEach((element) => element.dispatchEvent(new Event('unveil')));
		images = images.filter((element) => !loaded.includes(element));
	}

	window.addEventListener('scroll', checkInView);
	window.addEventListener('resize', checkInView);
	window.addEventListener('lookup', checkInView);

	checkInView();

	return this;
};

Joomla.applyImageLazyLoading = function () {
	const thumbnailElements = [...document.querySelectorAll('[loading=lazy]')];

	thumbnailElements.forEach((element) => {
		Joomla.unveil.call(element, 200, function () {
			this.addEventListener('load', function () {
				let thumbnailWrapper = this.closest('[easystore-thumbnail-wrapper]');
				let preloader = thumbnailWrapper.querySelector('.easystore-thumb-skeleton');

				if (preloader) {
					preloader.remove();
				}

				thumbnailWrapper.classList.remove('isLoading');
			});
		});
	});
};

// Image lazy loading
document.addEventListener('DOMContentLoaded', () => {
	Joomla.applyImageLazyLoading();
});
