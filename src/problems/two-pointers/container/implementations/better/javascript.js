function maxArea(heights) {
  let best = 0;
  for (let i = 0; i < heights.length; i++) {
    for (let j = heights.length - 1; j > i; j--) {
      // This left wall caps every narrower pair's height.
      if ((j - i) * heights[i] <= best) break;
      const area = (j - i) * Math.min(heights[i], heights[j]);
      best = Math.max(best, area);
    }
  }
  return best;
}
