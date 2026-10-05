function maxArea(heights: number[]): number {
  let i = 0,
    j = heights.length - 1;
  let best = 0;
  while (i < j) {
    const area = (j - i) * Math.min(heights[i], heights[j]);
    best = Math.max(best, area);
    // Keeping the shorter wall cannot improve a narrower pair.
    if (heights[i] <= heights[j]) i++;
    else j--;
  }
  return best;
}
