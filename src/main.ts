import {
  initNetlifyIdentity,
  cover,
  loadImages,
  type ClientData,
  type ImageData,
} from "./utils";

// handle netlify identity
initNetlifyIdentity();
document.addEventListener("DOMContentLoaded", () => {
  cover();
});

/*  Portifolio container */
const slideImagesRes = await loadImages("uploads/images.json")
const slideImages = await slideImagesRes.json() as ImageData


// Copy the images into a queue
let queue = [...slideImages.images];
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
    isTransitioning = false;
  }
};

setInterval(async () => {
  const first = queue.shift();
  if (first) queue.push(first);
  await renderImages();
}, 3000);

// Clients Section
const clientResponse = await loadImages("uploads/client.json");
const clientJson = await clientResponse.json() as ClientData;
let clientData = [...clientJson.client_images];
const initialClientRender = async () => {
  
  const rightImage = document.querySelector(".right-img img") as HTMLImageElement;
  const leftImage = document.querySelector(".left-img img") as HTMLImageElement;
  const mainImage = document.querySelector(".main-img") as HTMLImageElement;
  const userImage = document.querySelector(".user-img") as HTMLImageElement;
  const testimonial = document.querySelector(".client-say") as HTMLElement

  let index = 0
  rightImage.src = clientData[index++].file
  leftImage.src = clientData[index++].file
  mainImage.src = clientData[index].file
  userImage.src = clientData[index].user_image
  console.log(clientData[index].testimonial);
  
  testimonial.innerHTML = clientData[index].testimonial

};


initialClientRender()
setInterval( async () => {
  const first = clientData.shift()
  if (first) {
    clientData.push(first)
  }

  await initialClientRender()
  
},3000)