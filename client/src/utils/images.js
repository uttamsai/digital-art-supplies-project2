// Eagerly imports every product image so it is bundled by Vite, then exposes
// a simple filename -> URL lookup that mirrors the `image` / `thumbnail`
// fields stored in products.json.
const modules = import.meta.glob('../assets/images/*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
})

const imageMap = {}
for (const path in modules) {
  const filename = path.split('/').pop()
  imageMap[filename] = modules[path]
}

// products.json can point `image`/`thumbnail` at either a bundled local
// asset (a filename resolved above) or a full external URL (real product
// photography hotlinked from a manufacturer's site) — used as-is either way.
export function getProductImage(image) {
  if (!image) return ''
  if (/^https?:\/\//i.test(image)) return image
  return imageMap[image] || ''
}

// <img onError={(e) => useImageFallback(e, product.imageFallback)}>
// Hotlinked photos can occasionally 404 or get blocked by a hotlink-
// protection check after the fact, so every product also carries a
// generated placeholder in `imageFallback`. This swaps the broken <img> over
// to that placeholder once, instead of leaving a broken-image icon.
export function useImageFallback(event, fallbackFilename) {
  event.target.onerror = null
  event.target.src = getProductImage(fallbackFilename)
}
