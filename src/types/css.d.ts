// Type declarations for CSS imports
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Specific declaration for video.js CSS
declare module 'video.js/dist/video-js/video-js.css';
