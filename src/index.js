import axios from 'axios';
import { Notify } from 'notiflix';

const API_KEY = '39481144-61d2dc700e2d425d8e859c1c3';
const BASE_URL = 'https://pixabay.com/api/';

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};
let page = 1;
let per_page = 40;
let searchQuery = '';

refs.searchForm.addEventListener('submit', onSearchFormSubmit);

async function onSearchFormSubmit(e) {
  e.preventDefault();
  refs.gallery.innerHTML = '';
  page = 1;
  refs.loadMore.classList.add('visually-hidden');

  searchQuery = e.currentTarget.elements.searchQuery.value.trim();

  if (!searchQuery) {
    return;
  }

  try {
    const results = await getPhotos(searchQuery);
    console.log(results);
    if (!results.hits.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    createMarkup(results.hits);
    if (results.totalHits <= per_page) {
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }

    refs.loadMore.classList.remove('visually-hidden');
  } catch (error) {
    console.log(error);
  }
}

refs.loadMore.addEventListener('click', onLoadMoreClick);

async function onLoadMoreClick() {
  page += 1;
  try {
    const results = await getPhotos(searchQuery);
    createMarkup(results.hits);
    if (results.totalHits <= page * per_page) {
      refs.loadMore.classList.add('visually-hidden');
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    console.log(error);
  }
}

async function getPhotos(searchQuery) {
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page,
    per_page,
  });

  const url = ` ${BASE_URL}?${searchParams}`;

  const response = await axios(url);
  console.log(response);
  return response.data;
}

function createMarkup(array) {
  const markup = array
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${downloads}
    </p>
  </div>
</div>`
    )
    .join(' ');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}
