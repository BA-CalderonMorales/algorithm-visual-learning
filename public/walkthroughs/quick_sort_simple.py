def quick_sort(values):
    """Return a sorted copy. Choose a middle value, then split around it."""
    if len(values) < 2:
        return values[:]

    pivot = sorted((values[0], values[len(values) // 2], values[-1]))[1]
    smaller = [value for value in values if value < pivot]
    equal = [value for value in values if value == pivot]
    larger = [value for value in values if value > pivot]
    return quick_sort(smaller) + equal + quick_sort(larger)


print(quick_sort([4, 7, 8, 2, 9, 5, 6, 3, 1]))

