def max_area(heights: list[int]) -> int:
    best = 0
    for i in range(len(heights)):
        # Start wide, then try narrower pairs with this left wall.
        for j in range(len(heights) - 1, i, -1):
            # This left wall caps every narrower pair's height.
            if (j - i) * heights[i] <= best:
                break
            area = (j - i) * min(heights[i], heights[j])
            best = max(best, area)
    return best
