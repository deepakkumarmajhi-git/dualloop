from collections import Counter


def calculate_language_distribution(repositories):
    languages = [repo.language for repo in repositories if repo.language]

    counter = Counter(languages)

    total = sum(counter.values())

    if total == 0:
        return {}

    distribution = {
        language: round(count / total * 100, 2)
        for language, count in counter.items()
    }

    return distribution