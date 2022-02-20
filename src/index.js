import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import imageCardTpl from './templates/image-card.hbs';
// import ImagesApiService from './js/api-servic';
import LoadMoreBtn from './js/load-btn';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';


axios.defaults.baseURL = 'https://pixabay.com/';

export default class ImagesApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  async fetchImages() {
    const options = {
      params: {
        key: '25760251-3970e02ca371c5f8341f48ac2',
        q: this.searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: this.page,
      },
    };

      const response = await axios.get('api/', options);
      console.log('!!!!!')
    const dataImages = await response.data;
    this.incrementPage();
    return dataImages;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}

const refs = {
  searchForm: document.querySelector('#search-form'),
  galleryContainer: document.querySelector('.gallery'),
};

const imagesApiService = new ImagesApiService();
const loadMoreBtn = new LoadMoreBtn();

loadMoreBtn.hide();

refs.searchForm.addEventListener('submit', onSearch);
loadMoreBtn.refs.button.addEventListener('click', fetchQueryImages);

let hitsLengthSum;

function onSearch(e) {
  e.preventDefault();

  imagesApiService.query = e.currentTarget.elements.searchQuery.value;

  if (imagesApiService.query === '') {
    return errorQuery();
  }

  loadMoreBtn.hide();
  imagesApiService.resetPage();
  clearGalleryContainer();
  fetchQueryImages();

  hitsLengthSum = 0;
}

async function fetchQueryImages() {
  const { hits, totalHits } = await imagesApiService.fetchImages();

  if (hits.length === 0) {
    loadMoreBtn.hide();
    return errorQuery();
  }

  hitsLengthSum += hits.length;
  console.log(hitsLengthSum);

  if (hitsLengthSum > totalHits) {
    loadMoreBtn.hide();
    return Notify.info("We're sorry, but you've reached the end of search results");
  }

  renderImageCard(hits);

  loadMoreBtn.show();

  if (imagesApiService.page === 2) {
    Notify.success(`Hooray! We found ${totalHits} images.`);
  }
}

function renderImageCard(images) {
  refs.galleryContainer.insertAdjacentHTML('beforeend', imageCardTpl(images));

  lightboxGallery.refresh();

  if (imagesApiService.page > 2) {
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}

function clearGalleryContainer() {
  refs.galleryContainer.innerHTML = '';
}

function errorQuery() {
  Notify.failure('Sorry, there are no images matching your search query. Please try again');
}

const lightboxOptions = {
  captions: true,
  captionDelay: 250,
};


const lightboxGallery = new SimpleLightbox('.gallery a', lightboxOptions);