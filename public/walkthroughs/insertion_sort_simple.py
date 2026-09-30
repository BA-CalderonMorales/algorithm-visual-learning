def insertion_sort(values):
    """Grow a sorted prefix by shifting larger values to the right."""
    values = values[:]
    for index in range(1, len(values)):
        key = values[index]
        position = index
        while position > 0 and values[position - 1] > key:
            values[position] = values[position - 1]
            position -= 1
        values[position] = key
    return values


print(insertion_sort([4, 7, 8, 2, 9, 5, 6, 3, 1]))

