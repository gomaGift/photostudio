import { initNetlifyIdentity, cover, loadImages } from "./utils";

// handle netlify identity
initNetlifyIdentity();
document.addEventListener("DOMContentLoaded", () => {
  cover();
});

/*  Portifolio container */
const files = loadImages("../files.json");
const imageData = await files;
// featured Image
// const featuredImage = document.querySelector<HTMLImageElement>(".featured-area img")
// if (featuredImage) {
//   featuredImage.src = imageData.images[2].file
//   featuredImage.alt = "Featured Image"

// }

// // Gallery Images
// const photoCards = document.querySelectorAll<HTMLImageElement>(".photo-card img")
// photoCards.forEach((img, index) => {
//   const image = imageData.images[index+3]
//   img.src = image.file
//   img.alt = img.title
// })
// Assume imageData.images = [{ file: "...", title: "..." }, ...]

// Copy the images into a queue
let queue = [...imageData.images];
let isTransitioning = false;

// Function to create a sliding transition for an image element
function slideTransition(imgElement: HTMLImageElement, newSrc: string, newAlt: string): Promise<void> {
  return new Promise((resolve) => {
    const container = imgElement.parentElement;
    if (!container) {
      resolve();
      return;
    }

    // Create new image element
    const newImg = document.createElement('img');
    newImg.src = newSrc;
    newImg.alt = newAlt;
    newImg.style.width = '100%';
    newImg.style.height = '100%';
    newImg.style.objectFit = 'cover';
    newImg.style.position = 'absolute';
    newImg.style.top = '0';
    newImg.style.left = '0';
    newImg.classList.add('slide-in');

    // Add slide-out animation to current image
    imgElement.classList.add('slide-out');
    
    // Append new image to container
    container.appendChild(newImg);

    // Clean up after animation completes
    setTimeout(() => {
      // Remove old image
      if (container.contains(imgElement)) {
        container.removeChild(imgElement);
      }
      
      // Clean up classes from new image
      newImg.classList.remove('slide-in');
      
      resolve();
    }, 800); // Match the animation duration
  });
}

// Enhanced render function with sliding transitions
async function renderImages() {
  if (isTransitioning) return;
  
  isTransitioning = true;
  
  try {
    // Get all current images
    const featuredImage = document.querySelector<HTMLImageElement>('.featured-area img');
    const photoCards = document.querySelectorAll<HTMLImageElement>('.photo-card img');
    
    // Add transitioning class to prevent interactions
    document.querySelector('.portfolio-container')?.classList.add('transitioning');
    
    // Create array of transition promises
    const transitionPromises: Promise<void>[] = [];
    
    // Transition featured image
    if (featuredImage && queue[0]) {
      transitionPromises.push(
        slideTransition(featuredImage, queue[0].file, queue[0].title || 'Featured Image')
      );
    }
    
    // Transition photo cards
    photoCards.forEach((img, index) => {
      if (queue[index + 1]) {
        transitionPromises.push(
          slideTransition(
            img, 
            queue[index + 1].file, 
            queue[index + 1].title || `Photography Work ${index + 1}`
          )
        );
      }
    });
    
    // Wait for all transitions to complete
    await Promise.all(transitionPromises);
    
  } finally {
    // Remove transitioning class
    document.querySelector('.portfolio-container')?.classList.remove('transitioning');
    isTransitioning = false;
  }
}

// Initial render without transitions (for first load)
function initialRender() {
  const featuredImage = document.querySelector<HTMLImageElement>('.featured-area img');
  if (featuredImage && queue[0]) {
    featuredImage.src = queue[0].file;
    featuredImage.alt = queue[0].title || 'Featured Image';
  }

  const photoCards = document.querySelectorAll<HTMLImageElement>('.photo-card img');
  photoCards.forEach((img, index) => {
    if (queue[index + 1]) {
      img.src = queue[index + 1].file;
      img.alt = queue[index + 1].title || `Photography Work ${index + 1}`;
    }
  });
}

// Initial render
initialRender();

// Start the sliding animation loop
setInterval(async () => {
  // Take first element and push to end
  const first = queue.shift();
  if (first) {
    queue.push(first);
    
    // Re-render with sliding transitions
    await renderImages();
  }
}, 3000); 

