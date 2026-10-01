def tim_sort(values):
    """A teaching version: sort short runs, then merge neighboring runs."""
    run_size = 4
    runs = []
    for start in range(0, len(values), run_size):
        run = values[start:start + run_size]
        for index in range(1, len(run)):
            key = run[index]
            position = index
            while position > 0 and run[position - 1] > key:
                run[position] = run[position - 1]
                position -= 1
            run[position] = key
        runs.append(run)
    while len(runs) > 1:
        merged_runs = []
        for index in range(0, len(runs), 2):
            if index + 1 == len(runs):
                merged_runs.append(runs[index])
            else:
                left, right = runs[index], runs[index + 1]
                merged = []
                while left and right:
                    merged.append(left.pop(0) if left[0] <= right[0] else right.pop(0))
                merged_runs.append(merged + left + right)
        runs = merged_runs
    return runs[0] if runs else []


print(tim_sort([4, 7, 8, 2, 9, 5, 6, 3, 1]))
