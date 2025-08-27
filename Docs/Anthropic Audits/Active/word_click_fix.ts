// ✅ FIXED: Word click now only evaluates, doesn't show hints automatically
const handleWordClick = useCallback(async (word: string, sentence: any) => {
  if (!sentence) return
  
  // Only evaluate word on click - no automatic hints
  const evaluation = await evaluateWord(word, sentence)
  setWordEvaluations(prev => new Map(prev.set(word, evaluation)))
  
  // ❌ REMOVED: Automatic hint generation that was causing unwanted popups
  // const hint = await generateHint(word, sentence, 'basic')
  // setActiveHint(hint)
  
  // ✅ Hints are now only shown when explicitly requested via the Hint button
}, [evaluateWord])

// ✅ NEW: Separate function for explicit hint requests
const handleHintRequest = useCallback(async (word: string, sentence: any) => {
  if (!sentence) return
  
  // Check if we already have a hint for this word at this level
  if (activeHint?.word === word) {
    // Advance to next level if possible
    const nextLevel = activeHint.level === 'basic' ? 'intermediate' : 
                     activeHint.level === 'intermediate' ? 'complete' : 'basic'
    
    const hint = await generateHint(word, sentence, nextLevel)
    setActiveHint(hint)
  } else {
    // Start with basic hint
    const hint = await generateHint(word, sentence, 'basic')
    setActiveHint(hint)
  }
}, [activeHint, generateHint])