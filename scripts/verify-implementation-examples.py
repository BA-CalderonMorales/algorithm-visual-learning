"""Execute the displayed Python source against independent brute-force oracles."""
from contextlib import redirect_stdout
from io import StringIO
from itertools import product, combinations
from pathlib import Path

root = Path(__file__).resolve().parent.parent
inputs = [[], [-4], [0] * 5, [-4, -1, -1, 0, 1, 2], [1, 8, 6, 2, 5, 4, 8, 3, 7]]
inputs += [list(values) for size in range(6) for values in product([-1, 0, 1, 2], repeat=size)]
checked = 0


def load_function(path, name):
    scope = {"__name__": "example_test"}
    with redirect_stdout(StringIO()):
        exec(compile(path.read_text(encoding="utf-8"), str(path), "exec"), scope)
    return scope[name]


for problem, name in [("two-sum", "two_sum"), ("container", "max_area"), ("three-sum", "three_sum")]:
    for approach in ["brute", "better", "best"]:
        for language in ["python-simple.py", "python-typed.py"]:
            source = root / "src/problems/two-pointers" / problem / "implementations" / approach / language
            fn = load_function(source, name)
            for values in inputs:
                data = sorted(values) if problem == "two-sum" else [max(0, x) for x in values] if problem == "container" else values[:]
                before = data[:]
                if problem == "two-sum":
                    for target in [-2, 0, 2, 5]:
                        answer = fn(data, target)
                        exists = any(data[i] + data[j] == target for i, j in combinations(range(len(data)), 2))
                        assert (answer is not None) == exists, source
                        if answer is not None:
                            i, j = answer
                            assert 0 <= i < j < len(data) and data[i] + data[j] == target
                        checked += 1
                elif problem == "container":
                    expected = max([0] + [(j - i) * min(data[i], data[j]) for i, j in combinations(range(len(data)), 2)])
                    assert fn(data) == expected, source
                    checked += 1
                else:
                    expected = {tuple(sorted(triple)) for triple in combinations(data, 3) if sum(triple) == 0}
                    result = fn(data)
                    assert len(result) == len(set(result)) and set(result) == expected, source
                    checked += 1
                assert data == before, "Problem implementations must preserve input"

for algorithm in ["selection", "insertion", "quick", "merge", "tim", "shell", "counting"]:
    for language in ["python-simple.py", "python-typed.py"]:
        fn = load_function(root / "src/algorithms" / algorithm / "implementations" / language, algorithm + "_sort")
        in_place = language == "python-typed.py" and algorithm in ["selection", "insertion", "quick", "shell"]
        for values in inputs:
            data = values[:]
            result = fn(data)
            assert result == sorted(values), (algorithm, language, values)
            if in_place:
                assert result is data, "In-place example must return its input"
            else:
                assert data == values, "Copy-returning example must preserve input"
            checked += 1

print(f"Python implementations: {checked} checks; all approaches, duplicates, empty inputs and mutation contracts passed.")
