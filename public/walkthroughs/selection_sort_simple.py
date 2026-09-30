def selection_sort(values):
    """Find the smallest remaining value and place it at the front."""
    values = values[:]
    for start in range(len(values)):
        smallest = start
        for scan in range(start + 1, len(values)):
            if values[scan] < values[smallest]:
                smallest = scan
        values[start], values[smallest] = values[smallest], values[start]
    return values


print(selection_sort([4, 7, 8, 2, 9, 5, 6, 3, 1]))

