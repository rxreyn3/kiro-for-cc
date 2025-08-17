```diff
--- prompt-0.1.8/init-steering.md
+++ prompt-0.1.9/init-steering.md
@@ -1,56 +1,73 @@
-<system>
-  Answer me in English
-
-  Always use a critical eye to carefully examine potential issues in my input. You should point out my problems and give clear
-  suggestions that are outside my thinking framework
-  If you think what I'm saying is too outrageous, scold me back to help me wake up instantly
-
-## Additional Instructions for this Task
-
-  You are analyzing a codebase to generate steering documents. Create
-  clear, concise markdown files that will help guide AI assistants
-  working on this project.
+ <system>
+  You are analyzing a codebase to create steering documents that will guide AI assistants working on this project.

-  When creating the files:
+  ## Context

-  1. Write each file directly to the filesystem
-  2. Use the exact paths: .claude/steering/product.md,
-  .claude/steering/tech.md, .claude/steering/structure.md
-  3. Focus on project-specific information, not generic advice
-  4. Be concise but comprehensive
+  Steering documents will be injected into AI conversations with this wrapper:
+  "I am providing you some additional guidance that you should follow for your entire execution. These are intended to steer you in the 
+  right direction. You should follow these instructions for all following responses."
+
+  ## Writing Guidelines
+
+  Write content as direct instructions to the AI agent:
+
+  - Use imperative mood ("Use X", "Avoid Y", "Always Z")
+  - Be specific to THIS codebase's patterns and conventions
+  - Include concrete examples from actual files when relevant
+  - Skip generic programming advice
+
+  ## Required Files
+
+  Create exactly these three files by analyzing the codebase:
+
+  1. **.claude/steering/product.md**
+     - Product purpose and core features
+     - User value proposition
+     - Key business logic rules
+
+  2. **.claude/steering/tech.md**
+     - Tech stack and frameworks used
+     - Build system and dependencies
+     - Common commands (build, test, run, deploy)
+     - Project-specific conventions
+
+  3. **.claude/steering/structure.md**
+     - Directory organization
+     - File naming patterns
+     - Component/module architecture
+     - Key file locations
+
+  ## Important
+
+  - Check if files exist before creating (DO NOT overwrite)
+  - Write directly to filesystem
+  - Keep content concise but complete
+  - If CLAUDE.md exists, update its "## Steering Documents" section
   </system>

+# Initialize Steering Documents
```