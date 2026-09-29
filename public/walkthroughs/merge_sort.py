"""Merge Sort reference implementation.

Divide and conquer: YES — recursively sort halves, then merge them.
Runtime lower bound (best case): Θ(n log n) for this implementation.
Runtime upper bound (worst case): Θ(n log n).
Space: Θ(n) auxiliary.
"""

from collections.abc import Sequence
from typing import TypeVar

T = TypeVar("T")


def merge_sort(values: Sequence[T]) -> list[T]:
    """Return a sorted copy of values using the merge sort algorithm."""
    items = list(values)
    if len(items) <= 1:
        return items

    middle = len(items) // 2
    left = merge_sort(items[:middle])
    right = merge_sort(items[middle:])

    merged: list[T] = []
    left_i = right_i = 0
    while left_i < len(left) and right_i < len(right):
        if left[left_i] <= right[right_i]:
            merged.append(left[left_i])
            left_i += 1
        else:
            merged.append(right[right_i])
            right_i += 1
    merged.extend(left[left_i:])
    merged.extend(right[right_i:])
    return merged


if __name__ == "__main__":
    sample = [8, 1, 4, 9, 5, 3, 7, 2, 6, 0]
    print(merge_sort(sample))

