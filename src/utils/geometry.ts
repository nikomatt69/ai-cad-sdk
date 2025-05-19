import { Element } from '../types';

/**
 * Calculate bounding box for a set of elements
 */
export function calculateBoundingBox(elements: Element[]): {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
} {
  if (elements.length === 0) {
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
    };
  }

  const min = { x: Infinity, y: Infinity, z: Infinity };
  const max = { x: -Infinity, y: -Infinity, z: -Infinity };

  elements.forEach((el) => {
    // Handle different element types
    let halfWidth = 0,
      halfHeight = 0,
      halfDepth = 0;

    if ('width' in el && 'height' in el && 'depth' in el) {
      halfWidth = (el.width ?? 0) / 2;
      halfHeight = (el.height ?? 0) / 2;
      halfDepth = (el.depth ?? 0) / 2;
    } else if ('radius' in el) {
      halfWidth = el.radius ?? 0;
      halfHeight = el.radius ?? 0;
      halfDepth = el.radius ?? 0;
    }

    // Update min/max
    min.x = Math.min(min.x, el.x - halfWidth);
    min.y = Math.min(min.y, el.y - halfHeight);
    min.z = Math.min(min.z, el.z - halfDepth);

    max.x = Math.max(max.x, el.x + halfWidth);
    max.y = Math.max(max.y, el.y + halfHeight);
    max.z = Math.max(max.z, el.z + halfDepth);
  });

  return { min, max };
}

/**
 * Calculate center of a bounding box
 */
export function calculateCenter(
  boundingBox: ReturnType<typeof calculateBoundingBox>
): { x: number; y: number; z: number } {
  return {
    x: (boundingBox.min.x + boundingBox.max.x) / 2,
    y: (boundingBox.min.y + boundingBox.max.y) / 2,
    z: (boundingBox.min.z + boundingBox.max.z) / 2,
  };
}

/**
 * Calculate dimensions of a bounding box
 */
export function calculateDimensions(
  boundingBox: ReturnType<typeof calculateBoundingBox>
): { width: number; height: number; depth: number } {
  return {
    width: boundingBox.max.x - boundingBox.min.x,
    height: boundingBox.max.y - boundingBox.min.y,
    depth: boundingBox.max.z - boundingBox.min.z,
  };
}

/**
 * Calculate volume of a bounding box
 */
export function calculateVolume(
  boundingBox: ReturnType<typeof calculateBoundingBox>
): number {
  const dimensions = calculateDimensions(boundingBox);
  return dimensions.width * dimensions.height * dimensions.depth;
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(
  point1: { x: number; y: number; z: number },
  point2: { x: number; y: number; z: number }
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const dz = point2.z - point1.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Rotate a point around axis
 */
export function rotatePoint(
  point: { x: number; y: number; z: number },
  angles: { x: number; y: number; z: number },
  origin: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
): { x: number; y: number; z: number } {
  // Convert degrees to radians
  const radX = (angles.x * Math.PI) / 180;
  const radY = (angles.y * Math.PI) / 180;
  const radZ = (angles.z * Math.PI) / 180;

  // Translate point to origin
  let x = point.x - origin.x;
  let y = point.y - origin.y;
  let z = point.z - origin.z;

  // Rotate around X axis
  let newY = y * Math.cos(radX) - z * Math.sin(radX);
  let newZ = y * Math.sin(radX) + z * Math.cos(radX);
  y = newY;
  z = newZ;

  // Rotate around Y axis
  let newX = x * Math.cos(radY) + z * Math.sin(radY);
  newZ = -x * Math.sin(radY) + z * Math.cos(radY);
  x = newX;
  z = newZ;

  // Rotate around Z axis
  newX = x * Math.cos(radZ) - y * Math.sin(radZ);
  newY = x * Math.sin(radZ) + y * Math.cos(radZ);
  x = newX;
  y = newY;

  // Translate back from origin
  return {
    x: x + origin.x,
    y: y + origin.y,
    z: z + origin.z,
  };
}

/**
 * Scale elements from a center point
 */
export function scaleElements(
  elements: Element[],
  scale: { x: number; y: number; z: number },
  center?: { x: number; y: number; z: number }
): Element[] {
  if (elements.length === 0) return [];

  // Calculate center if not provided
  const originCenter =
    center || calculateCenter(calculateBoundingBox(elements));

  return elements.map((el) => {
    // Calculate vector from center to element
    const vectorX = el.x - originCenter.x;
    const vectorY = el.y - originCenter.y;
    const vectorZ = el.z - originCenter.z;

    // Scale the vector
    const scaledX = vectorX * scale.x;
    const scaledY = vectorY * scale.y;
    const scaledZ = vectorZ * scale.z;

    // Calculate new position
    const newX = originCenter.x + scaledX;
    const newY = originCenter.y + scaledY;
    const newZ = originCenter.z + scaledZ;

    // Create scaled element
    const scaledElement: Element = {
      ...el,
      x: newX,
      y: newY,
      z: newZ,
    };

    // Scale dimensions based on element type
    if ('width' in el && 'height' in el && 'depth' in el) {
      scaledElement.width = (el.width ?? 0) * scale.x;
      scaledElement.height = (el.height ?? 0) * scale.y;
      scaledElement.depth = (el.depth ?? 0) * scale.z;
    } else if ('radius' in el) {
      // For spheres, use average scale
      const avgScale = (scale.x + scale.y + scale.z) / 3;
      scaledElement.radius = (el.radius ?? 0) * avgScale;
    }

    return scaledElement;
  });
}

/**
 * Move elements to a new position
 */
export function moveElements(
  elements: Element[],
  translation: { x: number; y: number; z: number }
): Element[] {
  return elements.map((el) => ({
    ...el,
    x: el.x + translation.x,
    y: el.y + translation.y,
    z: el.z + translation.z,
  }));
}

/**
 * Rotate elements around a center point
 */
export function rotateElements(
  elements: Element[],
  angles: { x: number; y: number; z: number },
  center?: { x: number; y: number; z: number }
): Element[] {
  if (elements.length === 0) return [];

  // Calculate center if not provided
  const originCenter =
    center || calculateCenter(calculateBoundingBox(elements));

  return elements.map((el) => {
    // Rotate element position
    const rotatedPosition = rotatePoint(
      { x: el.x, y: el.y, z: el.z },
      angles,
      originCenter
    );

    // Get element's current rotation or default to zero
    const currentRotation = el.rotation || { x: 0, y: 0, z: 0 };

    // Add rotations
    const newRotation = {
      x: currentRotation.x + angles.x,
      y: currentRotation.y + angles.y,
      z: currentRotation.z + angles.z,
    };

    // Create rotated element
    return {
      ...el,
      x: rotatedPosition.x,
      y: rotatedPosition.y,
      z: rotatedPosition.z,
      rotation: newRotation,
    };
  });
}

/**
 * Get elements by type
 */
export function getElementsByType(
  elements: Element[],
  type: string
): Element[] {
  return elements.filter((el) => el.type === type);
}

/**
 * Group elements by type
 */
export function groupElementsByType(
  elements: Element[]
): Record<string, Element[]> {
  return elements.reduce((groups, element) => {
    const type = element.type;

    if (!groups[type]) {
      groups[type] = [];
    }

    groups[type].push(element);
    return groups;
  }, {} as Record<string, Element[]>);
}

/**
 * Get elements by layer
 */
export function getElementsByLayer(
  elements: Element[],
  layerId: string
): Element[] {
  return elements.filter((el) => el.layerId === layerId);
}

/**
 * Align elements to a grid
 */
export function alignToGrid(elements: Element[], gridSize: number): Element[] {
  return elements.map((el) => ({
    ...el,
    x: Math.round(el.x / gridSize) * gridSize,
    y: Math.round(el.y / gridSize) * gridSize,
    z: Math.round(el.z / gridSize) * gridSize,
  }));
}

/**
 * Check if two elements intersect
 */
export function elementsIntersect(
  element1: Element,
  element2: Element
): boolean {
  // Get bounding boxes for each element
  const box1 = {
    min: {
      x: element1.x - (element1.width || element1.radius || 0) / 2,
      y: element1.y - (element1.height || element1.radius || 0) / 2,
      z: element1.z - (element1.depth || element1.radius || 0) / 2,
    },
    max: {
      x: element1.x + (element1.width || element1.radius || 0) / 2,
      y: element1.y + (element1.height || element1.radius || 0) / 2,
      z: element1.z + (element1.depth || element1.radius || 0) / 2,
    },
  };

  const box2 = {
    min: {
      x: element2.x - (element2.width || element2.radius || 0) / 2,
      y: element2.y - (element2.height || element2.radius || 0) / 2,
      z: element2.z - (element2.depth || element2.radius || 0) / 2,
    },
    max: {
      x: element2.x + (element2.width || element2.radius || 0) / 2,
      y: element2.y + (element2.height || element2.radius || 0) / 2,
      z: element2.z + (element2.depth || element2.radius || 0) / 2,
    },
  };

  // Check for intersection using axis-aligned bounding box
  return (
    box1.min.x <= box2.max.x &&
    box1.max.x >= box2.min.x &&
    box1.min.y <= box2.max.y &&
    box1.max.y >= box2.min.y &&
    box1.min.z <= box2.max.z &&
    box1.max.z >= box2.min.z
  );
}

/**
 * Find all intersecting elements
 */
export function findIntersections(elements: Element[]): [Element, Element][] {
  const intersections: [Element, Element][] = [];

  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      if (elementsIntersect(elements[i], elements[j])) {
        intersections.push([elements[i], elements[j]]);
      }
    }
  }

  return intersections;
}
