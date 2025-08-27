// Netlify Identity
// src/utils/netlify-identity.ts

interface NetlifyIdentity {
  on(
    event: 'init' | 'login' | 'logout' | 'error' | 'open' | 'close',
    callback: (user?: any) => void,
  ): void;
  open(): void;
  close(): void;
  currentUser(): any;
}

declare global {
  interface Window {
    netlifyIdentity?: NetlifyIdentity;
  }
}

export function initNetlifyIdentity() {
  console.log('comes in here');
  const urlSearchParams = new URLSearchParams(window.location.hash.slice(1));
  console.log('paramss: ' + urlSearchParams);

  const invite_token = urlSearchParams.get('invite_token');
  if (invite_token) {
    window.location.href = `/admin#invite_token=${invite_token}`;
  } else {
    window.netlifyIdentity?.on('init', (user?: any) => {
      if (!user) {
        window.netlifyIdentity!.on('login', (loggedInUser?: any) => {
          // Check if user is confirmed
          if (loggedInUser && loggedInUser.confirmed_at) {
            document.location.href = `${window.location.origin}/admin`;
          } else {
            alert(
              'You have been invited but must set your password first. Please check your email.',
            );
            window.netlifyIdentity?.close(); // prevent broken session
          }
        });
      }
    });
  }
}




export const cover = () => {
  const cover = document.querySelector<HTMLElement>(".cover");
  const viewProjects = document.querySelector(".view-projects") as HTMLElement;
  const projectLinks = Array.from(
    document.querySelectorAll(".projects a")
  ) as HTMLAnchorElement[];

  if (cover && viewProjects) {
    // Add the class that triggers text animations
    cover.classList.add("visible");
    viewProjects.classList.add("visible");
  }

  // Stagger animation delays for project images
  projectLinks.reverse().forEach((link, index) => {
    link.style.animationDelay = `${0.6 + index * 0.9}s`;
  });
}

// load navbar


//  we want to load images innit fam,,
interface ImageItem {
  "date": string,
  "title": string,
  "category": string,
  "file": string
}

interface ImageData {
  "images": ImageItem[]
}

export const loadImages = async (path: string) => {
  // Implementation goes here
  const res = await fetch(path);
  const data: ImageData = await res.json();
  
  console.log("files: " + data);
  
  return data;
};

export const loadImage = async (fileName: string) => {
  console.log("fileName: " + fileName);

  const res = await fetch(fileName);
  const text = await res.text();
  return parseFrontmatter(text);
};

export function parseFrontmatter(content: string) {
  const parts = content.split("---");

  if (parts.length < 3) {
    return { frontmatter: {}, body: content };   //fallback if no frontmatter
  }

  const yamlText = parts[1].trim();
  const body = parts.slice(2).join("---").trim();

  const frontmatter: Record<string, string> = {};
  yamlText.split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      frontmatter[key.trim()] = rest.join(":").trim().replace(/^"|"$/g, "");
    }
  });

  return { frontmatter, body };
}
