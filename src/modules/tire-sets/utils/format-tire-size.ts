/**
 * Formats tire size components into a standard tire size string.
 * 
 * Combines treadWidth, aspectRatio, construction, and diameter into a single
 * formatted string following the pattern "treadWidth/aspectRatioConstructionDiameter".
 * 
 * @param treadWidth - The tire tread width (e.g., "225")
 * @param aspectRatio - The tire aspect ratio (e.g., "45")
 * @param construction - The tire construction type (e.g., "R")
 * @param diameter - The tire diameter (e.g., "17")
 * @returns Formatted tire size string (e.g., "225/45R17") or "N/A" if all components are missing
 * 
 * @example
 * formatTireSize("225", "45", "R", "17") // Returns "225/45R17"
 * formatTireSize("225", "", "R", "17") // Returns "225/R17"
 * formatTireSize("", "", "", "") // Returns "N/A"
 */
export function formatTireSize(
  treadWidth: string | null | undefined,
  aspectRatio: string | null | undefined,
  construction: string | null | undefined,
  diameter: string | null | undefined
): string {
  // Normalize inputs: convert null/undefined to empty string
  const width = treadWidth?.trim() ?? ''
  const ratio = aspectRatio?.trim() ?? ''
  const construct = construction?.trim() ?? ''
  const diam = diameter?.trim() ?? ''

  // Check if all components are empty
  if (!width && !ratio && !construct && !diam) {
    return 'N/A'
  }

  // Build the formatted string: width/ratioConstructionDiameter
  const parts: string[] = []

  // First part: treadWidth
  if (width) {
    parts.push(width)
  }

  // Second part: aspectRatio + construction + diameter
  const secondPart = `${ratio}${construct}${diam}`
  if (secondPart) {
    parts.push(secondPart)
  }

  // Join with "/" if we have both parts, otherwise return what we have
  if (parts.length === 2) {
    return `${parts[0]}/${parts[1]}`
  } else if (parts.length === 1) {
    return parts[0]
  }

  return 'N/A'
}
