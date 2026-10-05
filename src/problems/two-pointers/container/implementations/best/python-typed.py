def max_area(heights: list[int]) -> int:
    i, j = 0, len(heights) - 1
    best = 0
    while i < j:
        area = (j - i) * min(heights[i], heights[j])
        best = max(best, area)

        # Keeping the shorter wall cannot improve a narrower pair.
        if heights[i] <= heights[j]:
            i += 1
        else:
            j -= 1
    return best
