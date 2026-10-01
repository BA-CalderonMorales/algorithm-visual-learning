"""Readable TimSort-style implementation for studying runs and merges.

This demonstrates the core ideas; it is not CPython's production Timsort.
Divide and conquer: YES, in the merging of sorted runs (hybrid/adaptive).
Runtime lower bound (best case): Θ(n) when one natural run covers the input.
Runtime upper bound (worst case): O(n log n).
Space: O(n) for merging.
"""

from collections.abc import Sequence
from typing import TypeVar
T = TypeVar("T")


def _insertion_sort_run(items: list[T], start: int, end: int) -> None:
    for index in range(start + 1, end):
        key = items[index]
        scan = index - 1
        while scan >= start and items[scan] > key:
            items[scan + 1] = items[scan]
            scan -= 1
        items[scan + 1] = key


def _merge(items: list[T], start: int, middle: int, end: int) -> None:
    left, right = items[start:middle], items[middle:end]
    i = j = 0
    write = start
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            items[write] = left[i]
            i += 1
        else:
            items[write] = right[j]
            j += 1
        write += 1
    items[write:end] = left[i:] + right[j:]


def tim_sort(values: Sequence[T], min_run: int = 4) -> list[T]:
    """Sort a copy: detect ascending runs, extend short runs, then merge."""
    items = list(values)
    if len(items) < 2:
        return items

    runs: list[tuple[int, int]] = []
    start = 0
    while start < len(items):
        end = start + 1
        while end < len(items) and items[end - 1] <= items[end]:
            end += 1
        run_end = min(len(items), max(end, start + min_run))
        _insertion_sort_run(items, start, run_end)
        runs.append((start, run_end))
        start = run_end

    while len(runs) > 1:
        merged_runs: list[tuple[int, int]] = []
        for index in range(0, len(runs), 2):
            if index + 1 == len(runs):
                merged_runs.append(runs[index])
                continue
            left_start, middle = runs[index]
            _, right_end = runs[index + 1]
            _merge(items, left_start, middle, right_end)
            merged_runs.append((left_start, right_end))
        runs = merged_runs
    return items


if __name__ == "__main__":
    sample = [8, 1, 4, 9, 5, 3, 7, 2, 6, 0]
    print(tim_sort(sample))
