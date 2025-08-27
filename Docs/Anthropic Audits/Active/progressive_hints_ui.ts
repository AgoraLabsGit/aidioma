// ✅ ENHANCED: Progressive Hints UI with proper 3-level display
{activeHint && (
  <div className="p-4 bg-muted border border-border rounded-lg space-y-3">
    {/* Header with level info and close button */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          Level {activeHint.levelNumber} Hint for "{activeHint.word}"
        </span>
        <span className="text-xs text-muted-foreground">
          (-{activeHint.penalty} pts)
        </span>
      </div>
      <button
        onClick={() => setActiveHint(null)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
    
    {/* ✅ NEW: Visual level indicator */}
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((level) => (
        <div
          key={level}
          className={`w-2 h-2 rounded-full transition-colors ${
            level <= activeHint.levelNumber 
              ? 'bg-primary' 
              : 'bg-muted-foreground/30'
          }`}
        />
      ))}
      <span className="ml-2 text-xs text-muted-foreground capitalize">
        {activeHint.level} Hint
        {activeHint.levelNumber === 1 && ' • Basic context'}
        {activeHint.levelNumber === 2 && ' • More specific'}
        {activeHint.levelNumber === 3 && ' • Complete help'}
      </span>
    </div>
    
    {/* Hint content */}
    <p className="text-sm text-muted-foreground leading-relaxed">
      {activeHint.content}
    </p>
    
    {/* ✅ NEW: Advance hint button */}
    {activeHint.canAdvance && (
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          Need more help? Get a {activeHint.level === 'basic' ? 'detailed' : 'complete'} hint
        </span>
        <button
          onClick={advanceHintLevel}
          disabled={loadingHint}
          className="text-xs text-primary hover:text-primary/80 font-medium disabled:opacity-50 
                     flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/10 transition-colors"
        >
          {loadingHint ? (
            <>
              <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
              Loading...
            </>
          ) : (
            <>
              Next Level
              <ChevronRight className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    )}
    
    {/* ✅ NEW: Completion message for level 3 */}
    {activeHint.levelNumber === 3 && (
      <div className="text-xs text-muted-foreground italic">
        This is the most detailed hint available for "{activeHint.word}"
      </div>
    )}
  </div>
)}