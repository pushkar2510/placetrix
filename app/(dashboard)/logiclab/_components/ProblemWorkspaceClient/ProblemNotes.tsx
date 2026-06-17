"use client"

import React, { useState, useEffect, useRef } from "react"
import { getPersonalNote, savePersonalNote, getCommunityNotes, toggleUpvote } from "../../problems/[id]/notes-actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Loader2, Lock, ThumbsUp, Code, FileText, Globe, ArrowLeft,
  Bold, Italic, List, ListOrdered, Quote, Heading, Link as LinkIcon, Eye, EyeOff 
} from "lucide-react"
import { ProblemDescriptionViewer } from "./ProblemDescriptionViewer"
import { cn } from "@/lib/utils"

import Editor from "@monaco-editor/react"
import { createClient } from "@/lib/supabase/client"
import { LANGUAGES } from "../../_constants"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ProblemNotesProps {
  problemId: string
  currentCode: string
  currentLanguage: string
  submissions?: any[]
  isDailyChallenge?: boolean
}

export function ProblemNotes({ problemId, currentCode, currentLanguage, submissions, isDailyChallenge }: ProblemNotesProps) {
  const [showCommunityNotes, setShowCommunityNotes] = useState(false)

  // Personal Note State
  const [personalContent, setPersonalContent] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isPublicDialogOpen, setIsPublicDialogOpen] = useState(false)
  const [attachedCode, setAttachedCode] = useState<string | null>(null)
  const [attachedLanguage, setAttachedLanguage] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingPersonal, setIsLoadingPersonal] = useState(true)
  const [hasSolved, setHasSolved] = useState(false)

  // Community Notes State
  const [communityNotes, setCommunityNotes] = useState<any[]>([])
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set())
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load Personal Note
  useEffect(() => {
    async function load() {
      const res = await getPersonalNote(problemId)
      if (res.note) {
        let loadedContent = res.note.content || ""
        if (res.note.attached_code) {
          const codeBlock = `\n\n\`\`\`${res.note.attached_language || 'javascript'}\n${res.note.attached_code}\n\`\`\``;
          if (!loadedContent) {
            loadedContent = codeBlock.trim();
          } else if (!loadedContent.includes(res.note.attached_code)) {
            loadedContent += codeBlock;
          }
        }
        setPersonalContent(loadedContent)
        setIsPublic(res.note.is_public ?? false)
        setAttachedCode(res.note.attached_code || null)
        setAttachedLanguage(res.note.attached_language || null)
      }
      setHasSolved(res.hasSolved ?? false)
      setIsLoadingPersonal(false)
    }
    load()
  }, [problemId])

  // Load Community Notes
  useEffect(() => {
    if (showCommunityNotes) {
      async function load() {
        setIsLoadingCommunity(true)
        const res = await getCommunityNotes(problemId)
        if (!res.error) {
          setCommunityNotes(res.notes)
          setUpvotedIds(new Set(res.upvotedNoteIds as string[]))
        }
        setIsLoadingCommunity(false)
      }
      load()
    }
  }, [showCommunityNotes, problemId])

  const handleSave = async (override?: { isPublic?: boolean, attachedCode?: string | null }) => {
    setIsSaving(true)
    
    const currentIsPublic = override?.isPublic !== undefined ? override.isPublic : isPublic
    const currentAttachedCode = override?.attachedCode !== undefined ? override.attachedCode : attachedCode

    const res = await savePersonalNote({
      problemId,
      content: personalContent,
      isPublic: currentIsPublic,
      attachedCode: currentAttachedCode,
      attachedLanguage
    })
    
    if (!res.success) {
      toast.error(res.error || "Failed to save note")
    }
    setIsSaving(false)
  }

  const [isFetchingCode, setIsFetchingCode] = useState(false)

  const handleInsertAtEnd = (codeToInsert: string, lang: string) => {
    if (monacoEditorRef.current && codeToInsert) {
      const editor = monacoEditorRef.current
      const model = editor.getModel()
      const lineCount = model.getLineCount()
      const lastLineLength = model.getLineMaxColumn(lineCount)
      const currentContent = model.getValue()
      
      const targetLang = (lang || 'javascript').toLowerCase()
      const escapedLang = targetLang.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const blockRegex = new RegExp(`(^|\\n)\\s*\`\`\`${escapedLang}\\b`, 'i')
      
      if (blockRegex.test(currentContent)) {
        toast.error(`You have already attached a ${targetLang} solution!`)
        return
      }
      
      const newText = `\n\n\`\`\`${targetLang}\n${codeToInsert}\n\`\`\`\n`
      
      editor.executeEdits("my-source", [{
        range: {
          startLineNumber: lineCount,
          startColumn: lastLineLength,
          endLineNumber: lineCount,
          endColumn: lastLineLength
        },
        text: newText,
        forceMoveMarkers: true
      }])
      editor.revealLine(lineCount + 5)
      editor.focus()
      toast.success("Code inserted into your notes!")
    } else {
      toast.error("No code to attach.")
    }
  }

  const handleInsertCurrentCode = () => {
    if (!hasSolved) {
      toast.error("You must solve the problem first to attach code.")
      return
    }
    handleInsertAtEnd(currentCode, currentLanguage)
  }

  const handleInsertPastSubmission = async (sub: any) => {
    if (!hasSolved) {
      toast.error("You must solve the problem first to attach code.")
      return
    }
    setIsFetchingCode(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from(isDailyChallenge ? "logiclab_daily_challenge_submissions" : "logiclab_problem_submissions")
        .select("code, language_id")
        .eq("id", sub.id)
        .single()
      
      if (error || !data) throw new Error("Submission code not found")
      
      const langObj = LANGUAGES.find((l: any) => l.id === data.language_id)
      const langStr = langObj ? langObj.value : "javascript"
      
      handleInsertAtEnd(data.code, langStr)
    } catch (e: any) {
      toast.error("Failed to load submission: " + e.message)
    } finally {
      setIsFetchingCode(false)
    }
  }

  const handleUpvote = async (noteId: string) => {
    const isUpvoted = upvotedIds.has(noteId)
    setUpvotedIds(prev => {
      const next = new Set(prev)
      if (isUpvoted) next.delete(noteId)
      else next.add(noteId)
      return next
    })
    
    setCommunityNotes(notes => notes.map(n => {
      if (n.id === noteId) {
        return { ...n, upvotes_count: n.upvotes_count + (isUpvoted ? -1 : 1) }
      }
      return n
    }))

    const res = await toggleUpvote(noteId)
    if (!res.success) {
      toast.error("Failed to upvote")
      setUpvotedIds(prev => {
        const next = new Set(prev)
        if (isUpvoted) next.add(noteId)
        else next.delete(noteId)
        return next
      })
      setCommunityNotes(notes => notes.map(n => {
        if (n.id === noteId) {
          return { ...n, upvotes_count: n.upvotes_count + (isUpvoted ? 1 : -1) }
        }
        return n
      }))
    }
  }

  const monacoEditorRef = useRef<any>(null)
  const lastSavedContentRef = useRef(personalContent)
  const lastStateRef = useRef({ isPublic })

  // Debounced Auto-Save
  useEffect(() => {
    if (isLoadingPersonal) {
      lastSavedContentRef.current = personalContent
      lastStateRef.current = { isPublic }
      return
    }
    
    const contentChanged = personalContent !== lastSavedContentRef.current
    const stateChanged = isPublic !== lastStateRef.current.isPublic
    
    if (!contentChanged && !stateChanged) return
    
    const delay = stateChanged && !contentChanged ? 0 : 1500
    
    const handler = setTimeout(() => {
      handleSave()
      lastSavedContentRef.current = personalContent
      lastStateRef.current = { isPublic }
    }, delay)
    
    return () => clearTimeout(handler)
  }, [personalContent, isPublic])

  const insertFormat = (prefix: string, suffix: string = "") => {
    if (monacoEditorRef.current) {
      const editor = monacoEditorRef.current
      const selection = editor.getSelection()
      const text = editor.getModel().getValueInRange(selection)
      
      const newText = prefix + text + suffix
      editor.executeEdits("my-source", [{
        range: selection,
        text: newText,
        forceMoveMarkers: true
      }])
      editor.focus()
      
      if (text.length === 0) {
        const pos = editor.getPosition()
        editor.setPosition({ lineNumber: pos.lineNumber, column: pos.column - suffix.length })
      } else {
        editor.setSelection({
           startLineNumber: selection.startLineNumber,
           startColumn: selection.startColumn + prefix.length,
           endLineNumber: selection.endLineNumber,
           endColumn: selection.startLineNumber === selection.endLineNumber 
              ? selection.endColumn + prefix.length 
              : selection.endColumn
        })
      }
      return
    }

    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = personalContent.substring(start, end)
    
    const newText = personalContent.substring(0, start) + prefix + selectedText + suffix + personalContent.substring(end)
    setPersonalContent(newText)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }

  return (
    <div className={cn('flex-1', 'h-full', 'w-full', 'flex', 'flex-col', 'bg-card', 'overflow-hidden', 'min-h-0')}>
      {!showCommunityNotes ? (
        <>
          {/* Minimalist LeetCode Toolbar */}
          <div className={cn('flex', 'items-center', 'gap-2', 'px-4', 'py-2', 'shrink-0', 'border-b', 'border-border/10')}>
            <div className={cn('flex', 'items-center', 'gap-1')}>
              <Button variant="ghost" size="icon" className={cn('h-6', 'w-6', 'rounded', 'text-zinc-500', 'hover:text-zinc-300', 'hover:bg-zinc-800/50')} onClick={() => insertFormat("### ")} title="Heading">
                <span className={cn('font-serif', 'font-bold', 'text-[13px]')}>H</span>
              </Button>
              <Button variant="ghost" size="icon" className={cn('h-6', 'w-6', 'rounded', 'text-zinc-500', 'hover:text-zinc-300', 'hover:bg-zinc-800/50', 'font-serif', 'font-bold', 'text-[13px]')} onClick={() => insertFormat("**", "**")} title="Bold">
                B
              </Button>
              <Button variant="ghost" size="icon" className={cn('h-6', 'w-6', 'rounded', 'text-zinc-500', 'hover:text-zinc-300', 'hover:bg-zinc-800/50', 'font-serif', 'italic', 'text-[13px]')} onClick={() => insertFormat("*", "*")} title="Italic">
                I
              </Button>
            </div>
            
            <div className={cn('w-px', 'h-3', 'bg-zinc-700', 'mx-1')} />
            
            <div className={cn('flex', 'items-center', 'gap-1')}>
              <Button variant="ghost" size="icon" className={cn('h-6', 'w-6', 'rounded', 'text-zinc-500', 'hover:text-zinc-300', 'hover:bg-zinc-800/50')} onClick={() => insertFormat("- ")} title="Bulleted List">
                <List className={cn('w-3.5', 'h-3.5')} />
              </Button>
              <Button variant="ghost" size="icon" className={cn('h-6', 'w-6', 'rounded', 'text-zinc-500', 'hover:text-zinc-300', 'hover:bg-zinc-800/50')} onClick={() => insertFormat("1. ")} title="Numbered List">
                <ListOrdered className={cn('w-3.5', 'h-3.5')} />
              </Button>
            </div>

            <div className={cn('w-px', 'h-3', 'bg-zinc-700', 'mx-1')} />

            <div className={cn('flex', 'items-center', 'gap-1')}>
              <Button variant="ghost" size="icon" className={cn('h-6', 'w-6', 'rounded', 'text-zinc-500', 'hover:text-zinc-300', 'hover:bg-zinc-800/50', 'font-serif', 'font-bold', 'text-[14px]', 'leading-none', 'pb-1')} onClick={() => insertFormat("> ")} title="Quote">
                “
              </Button>
              <Button variant="ghost" size="icon" className={cn('h-6', 'w-6', 'rounded', 'text-zinc-500', 'hover:text-zinc-300', 'hover:bg-zinc-800/50', 'font-mono', 'text-[11px]')} onClick={() => insertFormat("```\n", "\n```")} title="Code Block">
                {"{}"}
              </Button>
              <Button variant="ghost" size="icon" className={cn('h-6', 'w-6', 'rounded', 'text-zinc-500', 'hover:text-zinc-300', 'hover:bg-zinc-800/50')} onClick={() => insertFormat("[", "](url)")} title="Link">
                <LinkIcon className={cn('w-3.5', 'h-3.5')} />
              </Button>
            </div>

            <div className={cn('w-px', 'h-3', 'bg-zinc-700', 'mx-2')} />
            
            <Button variant="ghost" size="icon" className={cn("h-6 w-6 rounded", previewMode ? "text-emerald-500 hover:text-emerald-400 bg-emerald-500/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50")} onClick={() => setPreviewMode(!previewMode)} title="Preview">
              <Eye className={cn('w-4', 'h-4')} />
            </Button>
            
            <div className={cn('ml-auto', 'flex', 'items-center', 'gap-3')}>
              <Button variant="link" size="sm" onClick={() => setShowCommunityNotes(true)} className={cn('h-auto', 'p-0', 'text-zinc-500', 'hover:text-zinc-300', 'text-[11px]')}>
                Community Notes <Globe className={cn('w-3', 'h-3', 'ml-1')} />
              </Button>
            </div>
          </div>
          
          {/* Editor / Preview Area */}
          <div className={cn('flex-1', 'flex', 'flex-col', 'overflow-hidden', 'outline-none', 'min-h-0', 'bg-[#1e1e1e]', 'relative')}>
            {isLoadingPersonal ? (
              <div className={cn('flex', 'items-center', 'justify-center', 'flex-1')}>
                <Loader2 className={cn('w-6', 'h-6', 'animate-spin', 'text-zinc-600')} />
              </div>
            ) : (
              <>
                {previewMode ? (
                  <div className={cn('flex-1', 'px-5', 'pt-0', 'pb-4', 'overflow-y-auto', 'md-notes-preview')}>
                    {personalContent 
                      ? <ProblemDescriptionViewer content={personalContent} />
                      : <span className={cn('italic', 'text-zinc-500', 'text-[13px]')}>Nothing to preview</span>}
                  </div>
                ) : (
                  <div className={cn('relative', 'flex-1', 'min-h-0')}>
                    {!personalContent && (
                      <div className={cn('absolute', 'top-0', 'left-5', 'text-zinc-500/50', 'text-[13px]', 'font-mono', 'pointer-events-none', 'z-10')}>
                        Write your notes here... (Markdown supported)
                      </div>
                    )}
                    <Editor
                      value={personalContent}
                      onChange={(value) => setPersonalContent(value || "")}
                      language="markdown"
                      theme="vs-dark"
                      onMount={(editor) => monacoEditorRef.current = editor}
                      options={{
                        minimap: { enabled: false },
                        automaticLayout: true,
                        wordWrap: "on",
                        lineNumbers: "off",
                        folding: false,
                        glyphMargin: false,
                        lineDecorationsWidth: 20,
                        lineNumbersMinChars: 0,
                        renderLineHighlight: "none",
                        scrollbar: { vertical: "auto", horizontal: "auto" },
                        padding: { top: 0, bottom: 16 },
                        fontSize: 13,
                        fontFamily: "var(--font-mono), monospace",
                        scrollBeyondLastLine: false,
                        overviewRulerBorder: false,
                        hideCursorInOverviewRuler: true
                      }}
                      className={cn('h-full', 'w-full')}
                    />
                  </div>
                )}


                {/* LeetCode Style Footer absolute at bottom right */}
                <div className={cn('absolute', 'bottom-0', 'left-0', 'right-0', 'flex', 'items-center', 'justify-end', 'px-5', 'py-3', 'pointer-events-none', 'bg-gradient-to-t', 'from-[#1e1e1e]', 'to-transparent', 'pt-8')}>
                  <div className={cn('flex', 'items-center', 'gap-2', 'pointer-events-auto')}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost"
                          size="sm"
                          disabled={!hasSolved || isFetchingCode}
                          className={cn('h-7', 'text-[11px]', 'px-3', 'rounded-md', 'border', 'text-zinc-300', 'bg-zinc-800/80', 'border-zinc-700/50', 'hover:bg-zinc-700/80')}
                          title={!hasSolved ? "Solve the problem first to attach code" : "Attach Code"}
                        >
                          {isFetchingCode ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Code className={cn('w-3.5', 'h-3.5', 'mr-1.5')} />}
                          Attach Code
                        </Button>
                      </DropdownMenuTrigger>
                      {hasSolved && (
                        <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
                          <DropdownMenuLabel className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Attach Code</DropdownMenuLabel>
                          <DropdownMenuItem onClick={handleInsertCurrentCode} className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer text-sm">
                            <Code className="w-3.5 h-3.5 mr-2" />
                            Current Editor Code
                          </DropdownMenuItem>
                          
                          {submissions && submissions.filter((s: any) => s.status === 'Accepted').length > 0 && (
                            <>
                              <DropdownMenuSeparator className="bg-zinc-800" />
                              <DropdownMenuLabel className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Past Submissions</DropdownMenuLabel>
                              {submissions.filter((s: any) => s.status === 'Accepted').map((sub: any) => (
                                <DropdownMenuItem key={sub.id} onClick={() => handleInsertPastSubmission(sub)} className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer text-sm">
                                  <FileText className="w-3.5 h-3.5 mr-2" />
                                  Accepted ({new Date(sub.created_at).toLocaleDateString()})
                                </DropdownMenuItem>
                              ))}
                            </>
                          )}
                        </DropdownMenuContent>
                      )}
                    </DropdownMenu>

                    {/* Make Public Button */}
                    <AlertDialog open={isPublicDialogOpen} onOpenChange={setIsPublicDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost"
                          size="sm"
                          disabled={!hasSolved}
                          className={cn("h-7 text-[11px] px-3 rounded-md border", 
                            isPublic 
                              ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" 
                              : "text-zinc-300 bg-zinc-800/80 border-zinc-700/50 hover:bg-zinc-700/80"
                          )}
                          title={!hasSolved ? "Solve the problem to share your notes" : "Toggle public visibility"}
                        >
                          {isPublic ? <Globe className={cn('w-3.5', 'h-3.5', 'mr-1.5')} /> : <Lock className={cn('w-3.5', 'h-3.5', 'mr-1.5')} />}
                          {isPublic ? "Public Note" : "Make Public"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-zinc-100">
                            {isPublic ? "Make Note Private?" : "Make Note Public?"}
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-zinc-400">
                            {isPublic 
                              ? "Your note will be removed from the Community Notes feed and will only be visible to you."
                              : "Your note will be visible to everyone in the Community Notes feed who has solved this problem. Ensure your note does not contain unmarked spoilers."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-100">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={async () => {
                              const newPublicState = !isPublic;
                              setIsPublic(newPublicState);
                              lastStateRef.current.isPublic = newPublicState;
                              await handleSave({ isPublic: newPublicState });
                              if (newPublicState) {
                                setShowCommunityNotes(true);
                              }
                            }}
                            className={isPublic ? "bg-red-500 hover:bg-red-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"}
                          >
                            {isPublic ? "Make Private" : "Make Public"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                  </div>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div className={cn('flex-1', 'flex', 'flex-col', 'overflow-y-auto', 'outline-none', 'bg-muted/10')}>
          <div className={cn('flex', 'items-center', 'justify-between', 'p-4', 'pb-2', 'sticky', 'top-0', 'bg-card/95', 'backdrop-blur', 'z-10', 'border-b', 'border-border/50')}>
            <Button variant="ghost" size="sm" onClick={() => setShowCommunityNotes(false)} className={cn('h-8', '-ml-2', 'text-muted-foreground')}>
              <ArrowLeft className={cn('w-4', 'h-4', 'mr-1.5')} /> Back to Editor
            </Button>
            <h2 className={cn('text-sm', 'font-semibold', 'flex', 'items-center', 'gap-2', 'text-muted-foreground')}>
              Community Notes <Globe className={cn('w-4', 'h-4')} />
            </h2>
          </div>

          {isLoadingCommunity ? (
            <div className={cn('flex', 'items-center', 'justify-center', 'h-32')}>
              <Loader2 className={cn('w-6', 'h-6', 'animate-spin', 'text-muted-foreground')} />
            </div>
          ) : communityNotes.length === 0 ? (
            <div className={cn('flex', 'flex-col', 'items-center', 'justify-center', 'h-full', 'text-muted-foreground', 'p-8', 'text-center', 'gap-2')}>
              <Globe className={cn('w-10', 'h-10', 'opacity-20')} />
              <p>No community notes available for this problem yet.</p>
              <p className={cn('text-sm', 'opacity-70')}>Be the first to share your notes!</p>
            </div>
          ) : (
            <div className={cn('flex', 'flex-col', 'gap-4', 'p-4')}>
              {!hasSolved && (
                <div className={cn('bg-blue-500/10', 'text-blue-600', 'dark:text-blue-400', 'p-3', 'rounded-lg', 'border', 'border-blue-500/20', 'text-sm', 'flex', 'items-start', 'gap-3')}>
                  <Lock className={cn('w-5', 'h-5', 'shrink-0', 'mt-0.5')} />
                  <p>You haven't solved this problem yet. Attached code solutions in community notes are hidden to prevent spoilers.</p>
                </div>
              )}
              
              {communityNotes.map((note) => (
                <div key={note.id} className={cn('bg-card', 'border', 'border-border/50', 'rounded-xl', 'overflow-hidden', 'shadow-sm')}>
                  <div className={cn('flex', 'items-center', 'justify-between', 'p-3', 'border-b', 'border-border/30', 'bg-muted/20')}>
                    <div className={cn('flex', 'items-center', 'gap-2')}>
                      <div className={cn('w-6', 'h-6', 'rounded-full', 'bg-primary/20', 'flex', 'items-center', 'justify-center', 'text-xs', 'font-bold', 'text-primary', 'shrink-0')}>
                        {((note.profiles as any)?.display_name || (note.profiles as any)?.[0]?.display_name)?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <span className={cn('text-sm', 'font-medium')}>{((note.profiles as any)?.display_name || (note.profiles as any)?.[0]?.display_name) || "Unknown User"}</span>
                      <span className={cn('text-xs', 'text-muted-foreground', 'ml-2')}>
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "h-8 gap-1.5 px-2", 
                        upvotedIds.has(note.id) && "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-600"
                      )}
                      onClick={() => handleUpvote(note.id)}
                    >
                      <ThumbsUp className={cn('w-3.5', 'h-3.5')} />
                      <span className={cn('text-xs', 'font-semibold')}>{note.upvotes_count}</span>
                    </Button>
                  </div>
                  
                  <div className="p-4">
                    {note.content ? (
                      <ProblemDescriptionViewer content={note.content} isSpoilerMode={!hasSolved} />
                    ) : (
                      <p className={cn('italic', 'text-muted-foreground', 'text-sm')}>No description provided.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
