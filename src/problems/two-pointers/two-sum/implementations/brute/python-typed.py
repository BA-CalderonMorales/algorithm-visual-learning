def two_sum(numbers: list[int], target: int) -> tuple[int, int] | None:
    # Try every pair of distinct positions.
    for i in range(len(numbers)):
        for j in range(i + 1, len(numbers)):
            if numbers[i] + numbers[j] == target:
                return (i, j)
    return None
