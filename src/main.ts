import { initNetlifyIdentity, cover, loadImages } from "./utils";

// handle netlify identity
initNetlifyIdentity();
document.addEventListener("DOMContentLoaded", () => {
  cover();
});

/*  Portifolio container */
const files = loadImages("/files.json");
const imageData = await files;

// Copy the images into a queue
let queue = [...imageData.images];
let isTransitioning = false;

// Function to create a sliding transition for an image element
function initialRender() {
  //  featured Image
  const featuredImage =
    document.querySelector<HTMLImageElement>(".featured-area img");
  if (featuredImage && queue[0]) {
    featuredImage.src = queue[0].file;
    featuredImage.alt = queue[0].title || "Featured Image";
  }

  //  photo cards
  const photoCardsImages =
    document.querySelectorAll<HTMLImageElement>(".photo-card img");
  photoCardsImages?.forEach((image, index) => {
    if (queue[index + 1]) {
      image.src = queue[index + 1].file;
      image.alt = queue[index + 1].title || "photo-card image";
    }
  });
}

// call initial render
initialRender();

// slide function
function slideTransition(
  image: HTMLImageElement,
  newSrc: string,
  newAlt: string
): Promise<void> {
  return new Promise((resolve) => {
    if (!image.parentElement) {
      resolve();
      return;
    }

    const parentContainer = image.parentElement;

    const newImage = document.createElement("img");
    newImage.src = newSrc;
    newImage.alt = newAlt;
    newImage.style.display = "absolute";
    newImage.style.top = "0";
    newImage.style.left = "0";
    newImage.style.height = "100%";
    newImage.style.width = "100%";

    newImage.classList.add("slide-in");
    image.classList.add("slide-out");
    parentContainer.appendChild(newImage);

    setInterval(() => {
      if (parentContainer.contains(image)) parentContainer.removeChild(image);

      newImage.classList.remove("slide-in");
      resolve();
    }, 800);
  });
}

const renderImages = async () => {
  if (isTransitioning) return;
  isTransitioning = true;

  try {
    const transitionPromises: Promise<void>[] = [];

    // get the featured Images
    const featuredImage =
      document.querySelector<HTMLImageElement>(".featured-area img");
    if (featuredImage && queue[0]) {
      transitionPromises.push(
        slideTransition(featuredImage, queue[0].file, queue[0].title)
      );
    }

    const photoCardsImages =
      document.querySelectorAll<HTMLImageElement>(".photo-card img");
    photoCardsImages?.forEach((image, index) => {
      transitionPromises.push(
        slideTransition(image, queue[index + 1].file, queue[index + 1].title)
      );
    });

    document
      .querySelector(".portfolio-container")
      ?.classList.add("transitioning");

    return Promise.all(transitionPromises);
  } finally {
    document
      .querySelector("portfolio-container")
      ?.classList.remove("transitioning");
     isTransitioning = false
  }
};

setInterval(async () => {
  const first = queue.shift();
  if (first) queue.push(first);
  await renderImages();
}, 3000);


// Clients Section
