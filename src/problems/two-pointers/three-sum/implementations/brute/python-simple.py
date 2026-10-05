def three_sum(values):
    answers = set()
    for a in range(len(values)):
        for i in range(a + 1, len(values)):
            for j in range(i + 1, len(values)):
                if values[a] + values[i] + values[j] == 0:
                    # Normalize only these three values to deduplicate.
                    triplet = tuple(sorted([values[a], values[i], values[j]]))
                    answers.add(triplet)
    return list(answers)
