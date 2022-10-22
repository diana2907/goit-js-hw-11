import { fetchImages } from './fetchImages.js';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import markup from './template/markup.hbs';
import './sass/index.scss';

const gallery = document.querySelector('.gallery');
const form = document.querySelector('.search-form');
const input = document.querySelector('input');
gallery.innerHTML = '';
const guard = document.querySelector('.guard');
let value = '';
let page = 0;

form.addEventListener('submit', searchImages);

function searchImages(e) {
  value = input.value.trim();
  e.preventDefault();
  gallery.innerHTML = '';
  if (!value) {
    gallery.innerHTML = '';
    return;
  } else {
    fetchImages(value, page).then(data => {
      const arr = data.data.hits;
      if (!arr.length) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        gallery.innerHTML = '';
        return;
      }
      //   gallery.innerHTML = markup(arr);
      gallery.insertAdjacentHTML('afterbegin', markup(arr));

      console.log(arr);
    });
  }
  //   onLoad(entries);
}

let options = {
  root: null,
  rootMargin: '10px',
  threshold: 1.0,
};
const observer = new IntersectionObserver(onLoad, options);
observer.observe(guard);

let quantity = 0;
function onLoad(entries) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      return;
    } else {
      page += 1;
      quantity += 12;
      console.log(quantity);
      fetchImages(value, page).then(data => {
        const arr = data.data.hits;
        // gallery.innerHTML = markup(arr);
        gallery.insertAdjacentHTML('beforeend', markup(arr));
        if (quantity >= data.data.totalHits) {
          observer.unobserve(guard);
          Notify.info(
            "We're sorry, but you've reached the end of search results."
          );
        }
        console.log(data.data);
        console.log(entry);
      });
    }
  });
}
