def shell_sort(values):
    """Compare items far apart first, then shrink the gap to one."""
    values = values[:]
    gap = len(values) // 2
    while gap > 0:
        for index in range(gap, len(values)):
            key = values[index]
            position = index
            while position >= gap and values[position - gap] > key:
                values[position] = values[position - gap]
                position -= gap
            values[position] = key
        gap //= 2
    return values


print(shell_sort([4, 7, 8, 2, 9, 5, 6, 3, 1]))
