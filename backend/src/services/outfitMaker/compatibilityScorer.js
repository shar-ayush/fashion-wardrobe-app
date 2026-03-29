// Color harmony rules based on your actual data colors
const COLOR_HARMONY = {
  'white':     { pairs: ['black','navy','beige','grey','brown','any'], neutral: true },
  'black':     { pairs: ['white','grey','beige','cream','any'], neutral: true },
  'beige':     { pairs: ['white','black','brown','navy','olive','cream'], neutral: true },
  'grey':      { pairs: ['white','black','navy','pink','any'], neutral: true },
  'cream':     { pairs: ['black','brown','beige','navy'], neutral: true },
  'navy':      { pairs: ['white','beige','grey','light blue','cream'], neutral: false },
  'dark blue': { pairs: ['white','beige','grey','black'], neutral: false },
  'brown':     { pairs: ['beige','white','olive','cream','camel'], neutral: false },
  'olive':     { pairs: ['beige','white','brown','black'], neutral: false },
  'red':       { pairs: ['black','white','navy','grey'], neutral: false },
  'pink':      { pairs: ['white','grey','black','beige'], neutral: false },
};

function getColorScore(primaryColor1, primaryColor2) {
  if (!primaryColor1 || !primaryColor2) return 50;

  const c1 = primaryColor1.toLowerCase().trim();
  const c2 = primaryColor2.toLowerCase().trim();

  if (c1 === c2) {
    const isNeutral = COLOR_HARMONY[c1]?.neutral;
    return isNeutral ? 70 : 45;
  }

  const rule = COLOR_HARMONY[c1];
  if (!rule) return 55;

  if (rule.pairs.includes('any')) return 88;
  if (rule.pairs.includes(c2)) return 95;

  const reverseRule = COLOR_HARMONY[c2];
  if (reverseRule?.pairs.includes(c1) || reverseRule?.pairs.includes('any')) return 90;

  return 30;
}

function getStyleScore(styles1, styles2) {
  if (!styles1?.length || !styles2?.length) return 50;

  const overlap = styles1.filter(s => styles2.includes(s));

  if (overlap.length === 0) {
    // Check if mixing is acceptable (e.g., casual + minimal is fine)
    const acceptableMix = [
      ['casual', 'minimal'],
      ['casual', 'streetwear'],
      ['minimal', 'formal'],
      ['sporty', 'casual'],
    ];

    const isMixOk = acceptableMix.some(([a, b]) =>
      (styles1.includes(a) && styles2.includes(b)) ||
      (styles1.includes(b) && styles2.includes(a))
    );

    return isMixOk ? 65 : 35;
  }

  return Math.min(95, 75 + overlap.length * 10);
}

function getFormalityScore(formality1, formality2) {
  if (!formality1 || !formality2) return 50;
  if (formality1 === formality2) return 100;

  // semi-formal bridges both worlds
  const hasSemiFormal =
    formality1 === 'semi-formal' || formality2 === 'semi-formal';

  if (hasSemiFormal) return 72;

  // casual + formal = bad match
  return 15;
}

function getOccasionScore(occasions1, occasions2, targetOccasion) {
  if (!targetOccasion) return 60;

  const has1 = occasions1?.includes(targetOccasion) ? 1 : 0;
  const has2 = occasions2?.includes(targetOccasion) ? 1 : 0;

  return ((has1 + has2) / 2) * 100;
}

// Score a full combination: top + bottom + shoes
function scoreCombination(top, bottom, shoes, targetOccasion) {
  // Color scores
  const topBottomColor = getColorScore(
    top.color?.primary,
    bottom.color?.primary
  );

  const bottomShoeColor = getColorScore(
    bottom.color?.primary,
    shoes.color?.primary
  );

  const topShoeColor = getColorScore(
    top.color?.primary,
    shoes.color?.primary
  );

  const colorScore =
    topBottomColor * 0.45 +
    bottomShoeColor * 0.35 +
    topShoeColor * 0.20;

  // Style
  const styleScore =
    getStyleScore(top.style, bottom.style) * 0.5 +
    getStyleScore(bottom.style, shoes.style) * 0.5;

  // Formality
  const formalityScore =
    getFormalityScore(top.formality, bottom.formality) * 0.6 +
    getFormalityScore(bottom.formality, shoes.formality) * 0.4;

  // Occasion
  const occasionScore =
    getOccasionScore(top.occasions, bottom.occasions, targetOccasion) * 0.5 +
    getOccasionScore(bottom.occasions, shoes.occasions, targetOccasion) * 0.5;

  const total =
    colorScore * 0.35 +
    styleScore * 0.25 +
    formalityScore * 0.25 +
    occasionScore * 0.15;

  return {
    total: Math.round(total),
    breakdown: {
      color: Math.round(colorScore),
      style: Math.round(styleScore),
      formality: Math.round(formalityScore),
      occasion: Math.round(occasionScore),
    },
  };
}

// Combination generator (keys fixed only)
function getTopCombinations(candidates, targetOccasion, limit = 3) {
  const { top, bottom, footwear } = candidates;

  const combinations = [];

  // Cap inputs to avoid O(n³) explosion
  const t = top.slice(0, 5);
  const b = bottom.slice(0, 5);
  const f = footwear.slice(0, 4);

  for (const topItem of t) {
    for (const bottomItem of b) {
      for (const shoeItem of f) {
        const score = scoreCombination(
          topItem,
          bottomItem,
          shoeItem,
          targetOccasion
        );

        combinations.push({
          top: topItem,
          bottom: bottomItem,
          shoe: shoeItem,
          score,
        });
      }
    }
  }

  return combinations
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, limit);
}

export { getTopCombinations };