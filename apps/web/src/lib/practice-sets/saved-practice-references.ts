export type SavedPracticeReference = Readonly<{
  collectionId: string;
  promptId: string;
}>;

export function savedPracticeReference(
  collectionId: string,
  promptId: string,
): SavedPracticeReference {
  if (!collectionId || !promptId) {
    throw new Error("Saved practice references require collection and prompt IDs");
  }

  return Object.freeze({ collectionId, promptId });
}

export function savedPracticeReferenceKey(reference: SavedPracticeReference) {
  return JSON.stringify([reference.collectionId, reference.promptId]);
}

export function hasSavedPracticeReference(
  references: readonly SavedPracticeReference[],
  reference: SavedPracticeReference,
) {
  const key = savedPracticeReferenceKey(reference);
  return references.some((candidate) => savedPracticeReferenceKey(candidate) === key);
}

export function addSavedPracticeReference(
  references: readonly SavedPracticeReference[],
  reference: SavedPracticeReference,
): SavedPracticeReference[] {
  return hasSavedPracticeReference(references, reference)
    ? [...references]
    : [...references, reference];
}

export function removeSavedPracticeReference(
  references: readonly SavedPracticeReference[],
  reference: SavedPracticeReference,
): SavedPracticeReference[] {
  const key = savedPracticeReferenceKey(reference);
  return references.filter((candidate) => savedPracticeReferenceKey(candidate) !== key);
}
