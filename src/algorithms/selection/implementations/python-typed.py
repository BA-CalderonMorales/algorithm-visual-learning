"""Selection Sort reference implementation.

Divide and conquer: NO.
Runtime lower bound (best case): Θ(n²) comparisons, even on sorted input.
Runtime upper bound (worst case): Θ(n²) comparisons.
Space: Θ(1) auxiliary; at most n-1 swaps.
"""

from collections.abc import MutableSequence
from typing import TypeVar
T = TypeVar("T")


def selection_sort(values: MutableSequence[T]) -> MutableSequence[T]:
    """Sort values in place by repeatedly selecting the remaining minimum."""
    size = len(values)
    for start in range(size - 1):
        smallest = start
        for candidate in range(start + 1, size):
            if values[candidate] < values[smallest]:
                smallest = candidate
        if smallest != start:
            values[start], values[smallest] = values[smallest], values[start]
    return values


if __name__ == "__main__":
    sample = [64, 25, 12, 22, 11]
    print(selection_sort(sample))
