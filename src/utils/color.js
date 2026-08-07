export function hexToRgb(hex) {
  if (!hex) return [0, 0, 0];
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6 && cleanHex.length !== 3) return [0, 0, 0];
  
  let r, g, b;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return [r, g, b];
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, x)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

/**
 * Mix a hex color with white. Factor 0 = base color, Factor 1 = pure white.
 */
export function mixWithWhite(hex, factor) {
  const [r, g, b] = hexToRgb(hex);
  const newR = Math.round(r + (255 - r) * factor);
  const newG = Math.round(g + (255 - g) * factor);
  const newB = Math.round(b + (255 - b) * factor);
  return rgbToHex(newR, newG, newB);
}

export function mixWithBlack(hex, factor) {
  const [r, g, b] = hexToRgb(hex);
  const newR = Math.round(r * (1 - factor));
  const newG = Math.round(g * (1 - factor));
  const newB = Math.round(b * (1 - factor));
  return rgbToHex(newR, newG, newB);
}

/**
 * DB에서 온 단일 색상(Hex)으로 프론트엔드 UI에 필요한 팔레트(light, blob)를 동적 생성합니다.
 */
export function generateEmotionPalette(baseColorHex) {
  const color = baseColorHex.toUpperCase();
  const [r, g, b] = hexToRgb(color);
  
  // 반투명 배경색 (기존 .20 ~ .24 와 유사하게 평균 .22 적용)
  const light = `rgba(${r},${g},${b},.22)`;
  
  // 그라데이션 물방울 색상 3종 (매우 밝음, 중간 밝음, 약간 밝음)
  const blob = [
    mixWithWhite(color, 0.9),  // 가장 밝은 하이라이트
    mixWithWhite(color, 0.6),  // 중간 톤
    mixWithWhite(color, 0.35)  // 베이스 컬러에 가까운 그림자/바탕
  ];

  return { color, light, blob };
}
