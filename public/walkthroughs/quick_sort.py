"""Quick Sort with median-of-three pivot and insertion-sort cutoff.

Divide and conquer: YES — partition, then recursively sort both sides.
Runtime lower bound (best case): Θ(n log n) for balanced partitions.
Runtime upper bound (worst case): O(n²) if partitions are highly unbalanced.
Space: O(log n) average recursion, O(n) worst-case recursion.
"""

from collections.abc import MutableSequence
from typing import TypeVar
T = TypeVar("T")


def quick_sort(values: MutableSequence[T], cutoff: int = 4) -> MutableSequence[T]:
    """Sort in place with Hoare partitioning and a small-range insertion sort."""
    def insertion(lo: int, hi: int) -> None:
        for index in range(lo + 1, hi + 1):
            key = values[index]
            scan = index - 1
            while scan >= lo and values[scan] > key:
                values[scan + 1] = values[scan]
                scan -= 1
            values[scan + 1] = key

    def sort(lo: int, hi: int) -> None:
        if hi - lo + 1 <= cutoff:
            insertion(lo, hi)
            return
        mid = (lo + hi) // 2
        samples = sorted((values[lo], values[mid], values[hi]))
        pivot = samples[1]
        i, j = lo, hi
        while True:
            while values[i] < pivot:
                i += 1
            while values[j] > pivot:
                j -= 1
            if i >= j:
                break
            values[i], values[j] = values[j], values[i]
            i += 1
            j -= 1
        sort(lo, j)
        sort(j + 1, hi)

    if values:
        sort(0, len(values) - 1)
    return values


if __name__ == "__main__":
    sample = [4, 7, 8, 2, 9, 5, 6, 3, 1]
    print(quick_sort(sample))

