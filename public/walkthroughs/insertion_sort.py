"""Insertion Sort reference implementation.

Divide and conquer: NO.
Runtime lower bound (best case): Θ(n), when the input is already ordered.
Runtime upper bound (worst case): Θ(n²), when values arrive in reverse order.
Space: Θ(1) auxiliary; stable.
"""

from collections.abc import MutableSequence
from typing import TypeVar

T = TypeVar("T")


def insertion_sort(values: MutableSequence[T]) -> MutableSequence[T]:
    """Sort values in place by inserting each key into the sorted prefix."""
    for index in range(1, len(values)):
        key = values[index]
        scan = index - 1
        while scan >= 0 and values[scan] > key:
            values[scan + 1] = values[scan]
            scan -= 1
        values[scan + 1] = key
    return values


if __name__ == "__main__":
    sample = [4, 7, 8, 2, 9, 5, 6, 3, 1]
    print(insertion_sort(sample))
