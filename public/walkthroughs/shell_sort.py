"""Shell Sort using the walkthrough's halving gap sequence.

Divide and conquer: NO — gap groups are interleaved insertion-sort passes.
Runtime lower bound (best case for these passes): Ω(n); already ordered input
also incurs one linear pass per gap, giving Θ(n log n) with halving gaps.
Runtime upper bound (worst case): O(n²) for this gap sequence.
Space: Θ(1) auxiliary. Bounds depend strongly on the chosen gap sequence.
"""

from collections.abc import MutableSequence
from typing import TypeVar
T = TypeVar("T")


def shell_sort(values: MutableSequence[T]) -> MutableSequence[T]:
    """Sort in place, starting at floor(n/2) and repeatedly halving the gap."""
    gap = len(values) // 2
    while gap > 0:
        for index in range(gap, len(values)):
            key = values[index]
            scan = index
            while scan >= gap and values[scan - gap] > key:
                values[scan] = values[scan - gap]
                scan -= gap
            values[scan] = key
        gap //= 2
    return values


if __name__ == "__main__":
    sample = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    print(shell_sort(sample))

