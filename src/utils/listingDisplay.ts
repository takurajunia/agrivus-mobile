/**
 * Build the display title for a listing from its crop type (category) and
 * crop name (specific product/variety).
 *
 * When the category is "Other", the category itself isn't a real product
 * name — the farmer's typed product name (cropName) IS the product, so it
 * should be shown on its own rather than as "Other (Garlic)".
 */
export function getListingDisplayTitle(
  cropType: string | null | undefined,
  cropName: string | null | undefined,
): string {
  const type = (cropType || "").trim();
  const name = (cropName || "").trim();

  if (type.toLowerCase() === "other") {
    return name || type || "Product";
  }

  if (!type) return name || "Product";
  if (!name || name.toLowerCase() === type.toLowerCase()) return type;
  return `${type} (${name})`;
}
