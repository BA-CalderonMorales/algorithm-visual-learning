def counting_sort(values):
    """Count each value, then expand the counts in sorted order."""
    if not values:
        return []
    smallest = min(values)
    counts = [0] * (max(values) - smallest + 1)
    for value in values:
        counts[value - smallest] += 1
    result = []
    for offset, count in enumerate(counts):
        result.extend([smallest + offset] * count)
    return result


print(counting_sort([4, 7, 8, 2, 9, 5, 6, 3, 1]))
