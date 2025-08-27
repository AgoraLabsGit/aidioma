// ✅ FIXED: Real progressive hints with proper API integration
const generateHint = useCallback(async (
  word: string, 
  sentence: any, 
  level: 'basic' | 'intermediate' | 'complete' = 'basic'
): Promise<HintData> => {
  if (!sentence) {
    return {
      word,
      level,
      levelNumber: level === 'basic' ? 1 : level === 'intermediate' ? 2 : 3,
      content: `Try thinking about "${word}" in context.`,
      penalty: 1.0,
      canAdvance: level !== 'complete'
    }
  }

  try {
    // ✅ REAL API CALL - No more mock data
    const response = await fetch('http://localhost:5001/api/sentences/progressive-hint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        word: word.trim(),
        level,
        context: sentence.spanish,
        sentenceId: sentence.id.toString(),
        // ✅ ADDED: Request Spanish-specific contextual hints
        targetLanguage: 'spanish',
        requestType: 'contextual_translation'
      })
    })

    if (!response.ok) {
      throw new Error(`Hint API responded with status: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Hint generation failed')
    }

    return {
      word: result.data.word,
      level: result.data.level,
      levelNumber: level === 'basic' ? 1 : level === 'intermediate' ? 2 : 3,
      content: result.data.content,
      penalty: result.data.penalty,
      canAdvance: level !== 'complete'
    }
  } catch (error) {
    console.error('Hint generation failed, using enhanced fallback:', error)
    
    // ✅ ENHANCED: Contextual Spanish fallback hints instead of generic
    const spanishWord = sentence.spanish.toLowerCase()
    const englishWord = word.toLowerCase()
    
    const fallbackHints = {
      basic: `"${word}" relates to: ${spanishWord.includes(englishWord) ? 
        'Look for a similar word in the Spanish text' : 
        'Think about the core meaning in this sentence context'}`,
      intermediate: `"${word}" in Spanish context: The sentence structure suggests this word is ${
        /^(the|a|an)$/i.test(word) ? 'an article (el/la/un/una)' :
        /^(is|are|was|were)$/i.test(word) ? 'a verb form (es/está/son/están)' :
        /ing$/.test(word) ? 'an action or gerund' :
        'a key content word - look at the Spanish equivalent'
      }`,
      complete: `"${word}" Spanish translation help: ${
        spanishWord.includes('el ') || spanishWord.includes('la ') ? 'Look for articles (el/la)' :
        spanishWord.includes('es ') ? 'Look for "es" (is)' :
        spanishWord.includes('está') ? 'Look for "está" (is/located)' :
        'Check the Spanish text for the corresponding word pattern'
      }`
    }
    
    return {
      word,
      level,
      levelNumber: level === 'basic' ? 1 : level === 'intermediate' ? 2 : 3,
      content: fallbackHints[level] || fallbackHints.basic,
      penalty: level === 'basic' ? 1.0 : level === 'intermediate' ? 2.0 : 3.0,
      canAdvance: level !== 'complete'
    }
  }
}, [])

// ✅ ADDED: Hint level advancement function
const advanceHintLevel = useCallback(async () => {
  if (!activeHint?.canAdvance || !currentSentence) return
  
  setLoadingHint(true)
  try {
    const nextLevel = activeHint.level === 'basic' ? 'intermediate' : 'complete'
    const newHint = await generateHint(activeHint.word, currentSentence, nextLevel)
    setActiveHint(newHint)
  } catch (error) {
    console.error('Failed to advance hint level:', error)
  } finally {
    setLoadingHint(false)
  }
}, [activeHint, currentSentence, generateHint])