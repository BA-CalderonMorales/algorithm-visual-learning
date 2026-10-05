def two_sum(numbers, target):
    i, j = 0, len(numbers) - 1
    while i < j:
        total = numbers[i] + numbers[j]
        if total == target:
            return (i, j)
        if total < target:
            # Even the largest partner is too small for numbers[i].
            i += 1
        else:
            # Even the smallest partner is too large for numbers[j].
            j -= 1
    return None
