import path from "node:path";
import { readFileSync } from "node:fs";
const root = path.resolve(import.meta.dirname, "..");
const catalogue = JSON.parse(
  readFileSync(path.join(root, "data/documentation.json"), "utf8"),
);
const pages = new Map(
  catalogue.map((doc) => [
    path.resolve(root, doc.path),
    "/methodology/" + doc.slug + "/",
  ]),
);
export default function documentationLinks() {
  return (tree, file) => {
    if (!pages.has(path.resolve(file.path))) return;
    // The page layout supplies its single h1.
    tree.children = tree.children.filter(
      (node) => !(node.type === "heading" && node.depth === 1),
    );
    const visit = (node) => {
      if (
        node.type === "link" &&
        node.url &&
        !/^(?:[a-z]+:|\/|#)/i.test(node.url)
      ) {
        const [pathname, hash] = node.url.split("#");
        const destination = path.resolve(path.dirname(file.path), pathname);
        const mapped = pages.get(destination);
        node.url = mapped
          ? mapped + (hash ? "#" + hash : "")
          : "https://github.com/moset15/KEO/blob/feat/product-hunt-mvp/" +
            path.relative(root, destination).split(path.sep).join("/") +
            (hash ? "#" + hash : "");
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}
