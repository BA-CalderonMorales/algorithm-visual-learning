def three_sum(values):
    answers = set()
    for a in range(len(values)):
        seen = set()
        for j in range(a + 1, len(values)):
            needed = -values[a] - values[j]
            if needed in seen:
                triplet = tuple(sorted([values[a], needed, values[j]]))
                answers.add(triplet)
            # Add after checking, so the same position is never reused.
            seen.add(values[j])
    return list(answers)
