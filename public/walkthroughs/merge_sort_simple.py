def merge_sort(values):
    """Sort by splitting the list, then merging two sorted halves."""
    if len(values) < 2:
        return values[:]
    middle = len(values) // 2
    left = merge_sort(values[:middle])
    right = merge_sort(values[middle:])
    merged = []
    while left and right:
        if left[0] <= right[0]:
            merged.append(left.pop(0))
        else:
            merged.append(right.pop(0))
    return merged + left + right


print(merge_sort([4, 7, 8, 2, 9, 5, 6, 3, 1]))

