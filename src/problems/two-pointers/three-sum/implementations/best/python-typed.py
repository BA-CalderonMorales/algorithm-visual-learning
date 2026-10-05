def three_sum(values: list[int]) -> list[tuple[int, int, int]]:
    numbers = sorted(values)  # Keep the caller's input unchanged.
    answers = []
    for a in range(len(numbers) - 2):
        if a > 0 and numbers[a] == numbers[a - 1]:
            continue
        if numbers[a] > 0:
            break

        i, j = a + 1, len(numbers) - 1
        while i < j:
            total = numbers[a] + numbers[i] + numbers[j]
            if total < 0:
                i += 1
            elif total > 0:
                j -= 1
            else:
                answers.append((numbers[a], numbers[i], numbers[j]))
                i += 1
                j -= 1
                # Same endpoint values would repeat the same triplet.
                while i < j and numbers[i] == numbers[i - 1]:
                    i += 1
                while i < j and numbers[j] == numbers[j + 1]:
                    j -= 1
    return answers
