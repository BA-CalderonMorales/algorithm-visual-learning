def bubble_sort(values: list[int]) -> list[int]:
    a = list(values)
    for end in range(len(a) - 1, 0, -1):
        changed = False
        for j in range(end):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                changed = True
        if not changed:
            break
    return a
