#!/usr/bin/env python3
"""
Initialize AI Collaboration System
Sets up files and shows instructions
"""

from pathlib import Path
from datetime import datetime

def init_collaboration():
    """Initialize the AI collaboration system"""
    print("🚀 Initializing AI Collaboration System...")
    
    # Create logs directory
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    print("📁 Created logs/ directory")
    
    # Create ai_chat.md in logs
    ai_chat = logs_dir / "ai_chat.md"
    if not ai_chat.exists():
        ai_chat.write_text("""<!-- DEVELOPMENT WORKFLOW INSTRUCTIONS
CURSOR (Cmd+Shift+D): 
1. Read this file (logs/ai_chat.md)
2. Look for CURSOR_TURN in the last message
3. Execute your current phase (PLAN → DELIVERABLES → DEVELOP → REVIEW)
4. Write timestamped response below
5. End with COPILOT_TURN or HUMAN_APPROVAL_NEEDED

COPILOT (Cmd+Shift+R):
1. Read this file (logs/ai_chat.md)
2. Look for COPILOT_TURN in the last message
3. Review based on phase (PRE-DEV → CODE → FINAL)
4. Write timestamped response below
5. End with CURSOR_TURN or HUMAN_APPROVAL_NEEDED

Keep messages concise. Update dev_log.md with summaries.
-->

# AI Development Chat

## Current Task: None
## Current Phase: PLAN

---

START - Press Cmd+Shift+D in Cursor to begin the first development cycle.
""")
        print("✅ Created logs/ai_chat.md")
    else:
        print("📄 logs/ai_chat.md already exists")
    
    # Create dev_log.md in logs
    dev_log = logs_dir / "dev_log.md"
    if not dev_log.exists():
        dev_log.write_text(f"""# Development Log

Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## PREDEVELOPMENT PLAN

## PREDEVELOPMENT DELIVERABLES

## POST DEVELOPMENT

---
""")
        print("✅ Created logs/dev_log.md")
    else:
        print("📄 logs/dev_log.md already exists")
    
    # Create archived_logs.md in logs
    archived_logs = logs_dir / "archived_logs.md"
    if not archived_logs.exists():
        archived_logs.write_text(f"""# Archived Logs

Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

This file stores older conversations and logs for reference.

---
""")
        print("✅ Created logs/archived_logs.md")
    else:
        print("📄 logs/archived_logs.md already exists")
    
    # Show setup instructions
    print("\n" + "="*60)
    print("📋 SETUP INSTRUCTIONS")
    print("="*60)
    
    print("\n1️⃣  In Cursor, set up this keyboard shortcut:")
    print("   Cmd/Ctrl + Shift + D → Triggers development cycle")
    print("\n   Give Cursor this simple instruction:")
    print("   'Read logs/ai_chat.md and follow the instructions at the top'")
    
    print("\n2️⃣  In VSCode with Copilot, set up:")
    print("   Cmd/Ctrl + Shift + R → Triggers review cycle")
    print("\n   Give Copilot this simple instruction:")
    print("   'Read logs/ai_chat.md and follow the instructions at the top'")
    
    print("\n3️⃣  Run the status dashboard (optional):")
    print("   python status.py")
    
    print("\n4️⃣  Start development:")
    print("   Press Cmd+Shift+D in Cursor")
    
    print("\n" + "="*60)
    print("✨ Ready! The AIs will communicate through logs/ai_chat.md")
    print("="*60)
    
    print("\n📁 Created structure:")
    print("   logs/")
    print("   ├── ai_chat.md       (AI communication)")
    print("   ├── dev_log.md       (Development record)")
    print("   └── archived_logs.md (Old conversations)")
    print("="*60)

if __name__ == "__main__":
    init_collaboration()