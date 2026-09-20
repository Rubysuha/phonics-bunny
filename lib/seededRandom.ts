/* ─────────────────────────────
   Random
───────────────────────────── */

export function hashString(
  value: string
): number {
  let hash =
    2166136261;

  for (
    let i = 0;
    i < value.length;
    i += 1
  ) {
    hash ^=
      value.charCodeAt(
        i
      );

    hash =
      Math.imul(
        hash,
        16777619
      );
  }

  return (
    hash >>> 0
  );
}

export function createRandom(
  seed: number
): () => number {
  let value =
    seed ||
    123456789;

  return () => {
    value ^=
      value << 13;

    value ^=
      value >>> 17;

    value ^=
      value << 5;

    return (
      (value >>> 0) /
      4294967296
    );
  };
}

export function shuffle<T>(
  items: T[],
  random:
    () => number
): T[] {
  const result =
    [...items];

  for (
    let i =
      result.length - 1;
    i > 0;
    i -= 1
  ) {
    const j =
      Math.floor(
        random() *
          (i + 1)
      );

    [
      result[i],
      result[j],
    ] = [
      result[j],
      result[i],
    ];
  }

  return result;
}
