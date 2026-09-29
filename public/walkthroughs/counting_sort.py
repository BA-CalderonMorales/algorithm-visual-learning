"""Stable Counting Sort for integer values, including negative integers.

Divide and conquer: NO.
Runtime lower bound (best case): Θ(n + k), where k = max(value)-min(value)+1.
Runtime upper bound (worst case): Θ(n + k).
Space: Θ(n + k). This is not comparison sorting; the range k matters.
"""

from collections.abc import Sequence


def counting_sort(values: Sequence[int]) -> list[int]:
    """Return a stable sorted copy; supports negative values by offsetting."""
    if not values:
        return []
    minimum, maximum = min(values), max(values)
    counts = [0] * (maximum - minimum + 1)

    for value in values:
        counts[value - minimum] += 1
    for index in range(1, len(counts)):
        counts[index] += counts[index - 1]

    output = [0] * len(values)
    for value in reversed(values):
        bucket = value - minimum
        counts[bucket] -= 1
        output[counts[bucket]] = value
    return output


if __name__ == "__main__":
    print(counting_sort([4, 2, 2, 8, 3, 3, 1, 4, 0, 2]))

