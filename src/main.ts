import { initNetlifyIdentity, cover } from "./utils";

// handle netlify identity
initNetlifyIdentity()
document.addEventListener('DOMContentLoaded', () => {
  cover()
})