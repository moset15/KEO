/// <reference types="astro/client" />
declare module "*.md" {
  const content: string;
  export default content;
}
