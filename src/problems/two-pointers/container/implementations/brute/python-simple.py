def max_area(heights):
    best = 0
    for i in range(len(heights)):
        for j in range(i + 1, len(heights)):
            area = (j - i) * min(heights[i], heights[j])
            best = max(best, area)
    return best
