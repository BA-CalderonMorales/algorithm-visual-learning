def two_sum(numbers: list[int], target: int) -> tuple[int, int] | None:
    for i in range(len(numbers)):
        needed = target - numbers[i]
        left, right = i + 1, len(numbers) - 1

        # Search only to the right: never reuse index i.
        while left <= right:
            middle = (left + right) // 2
            if numbers[middle] == needed:
                return (i, middle)
            if numbers[middle] < needed:
                left = middle + 1
            else:
                right = middle - 1
    return None
