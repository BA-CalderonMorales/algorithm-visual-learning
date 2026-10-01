def merge_sort(values):
    """Sort by splitting the list, then merging two sorted halves."""
    if len(values) < 2:
        return values[:]
    middle = len(values) // 2
    left = merge_sort(values[:middle])
    right = merge_sort(values[middle:])
    merged = []
    i = 0
    j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    return merged + left[i:] + right[j:]


print(merge_sort([4, 7, 8, 2, 9, 5, 6, 3, 1]))
