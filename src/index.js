import { fetchImages } from './fetchImages.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import markup from './template/markup.hbs';
import './sass/index.scss';

const gallery = document.querySelector('.gallery');
const form = document.querySelector('.search-form');
const input = document.querySelector('input');
const guard = document.querySelector('.guard');
const ligthbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
  close: true,
  spinner: true,
});
let value = '';
let page = 0;
let quantity = 0;

gallery.innerHTML = '';

form.addEventListener('submit', searchImages);

async function searchImages(e) {
  value = input.value.trim();
  e.preventDefault();
  page = 1;
  gallery.innerHTML = '';

  if (!value) {
    gallery.innerHTML = '';
    return;
  } else {
    await fetchImages(value, page).then(data => {
      const arr = data.data.hits;
      if (!arr.length) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        gallery.innerHTML = '';
        return;
      } else {
        quantity = arr.length;
        Notify.success(`Hooray! We found ${data.data.totalHits} images.`);
        gallery.insertAdjacentHTML('beforeend', markup(arr));
        ligthbox.refresh();
      }
      observer.observe(guard);
      console.log(arr);
    });
  }
}

let options = {
  root: null,
  rootMargin: '50px',
  threshold: 0.8,
};
const observer = new IntersectionObserver(onLoad, options);

async function onLoad(entries) {
  await entries.forEach(entry => {
    if (!entry.isIntersecting) {
      return;
    } else {
      page += 1;

      fetchImages(value, page).then(data => {
        const arr = data.data.hits;
        if (!value) {
          gallery.innerHTML = '';
          return;
        } else if (page >= 2) {
          quantity += arr.length;
          gallery.insertAdjacentHTML('beforeend', markup(arr));
          ligthbox.refresh();
        }
        if (quantity >= data.data.totalHits) {
          observer.unobserve(guard);
          Notify.info(
            "We're sorry, but you've reached the end of search results."
          );
        }
        console.log(quantity);
        console.log(data.data);
        console.log(entry);
      });
    }
  });
}
