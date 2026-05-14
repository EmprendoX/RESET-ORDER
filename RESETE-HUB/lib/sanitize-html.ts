import DOMPurify from "isomorphic-dompurify";

const YOUTUBE_EMBED_RE = /^https:\/\/(www\.)?youtube(-nocookie)?\.com\/embed\//i;

let hookConfigured = false;
function ensureHook() {
  if (hookConfigured) return;
  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName === "iframe") {
      const src = (node as Element).getAttribute("src") || "";
      if (!YOUTUBE_EMBED_RE.test(src)) {
        node.parentNode?.removeChild(node);
      }
    }
  });
  hookConfigured = true;
}

const ALLOWED_TAGS = [
  "p",
  "br",
  "span",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "img",
  "iframe",
  "code",
  "pre",
  "hr",
  "div",
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "style",
  "class",
  "width",
  "height",
  "frameborder",
  "allow",
  "allowfullscreen",
  "loading",
  "referrerpolicy",
];

export function sanitizePostHtml(html: string): string {
  ensureHook();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(https?:|mailto:|tel:|\/|#)/i,
  });
}
