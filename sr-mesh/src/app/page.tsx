"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { aiWorker } from "@/lib/ai/worker-client";
import { 
  saveNote, 
  getAllNotes, 
  searchSimilarNotes, 
  deleteNote, 
  updateNote, 
  clearAllNotes,
  calculateEdges,
  type Note,
  type Edge
} from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { Scene } from "@/components/canvas/Scene";
import { LoadingSkeleton } from "@/components/canvas/LoadingSkeleton";
import { Plus, Search, Brain, Loader2, X, Sparkles, Trash2, Edit3, Settings, AlertTriangle, Eye, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SimilarNote } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";

export default function Home() {
  // Core state
  const [memories, setMemories] = useState<Note[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editContent, setEditContent] = useState("");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SimilarNote[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Related notes in editor
  const [related, setRelated] = useState<SimilarNote[]>([]);
  
  // Toast notifications
  const { toast, confirm } = useToast();

  const refreshMemories = useCallback(async () => {
    const all = await getAllNotes();
    setMemories(all);
    const e = await calculateEdges(0.55);
    setEdges(e);
  }, []);

  useEffect(() => {
    refreshMemories();
  }, [refreshMemories]);

  // === Keyboard Shortcuts ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close modals
      if (e.key === 'Escape') {
        setIsEditorOpen(false);
        setIsSearchOpen(false);
        setIsSettingsOpen(false);
        setIsHelpOpen(false);
        setViewingNote(null);
        setEditingNote(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // === Create Note ===
  const handleSave = async () => {
    if (!input.trim() || isProcessing) return;
    setIsProcessing(true);
    
    try {
      const embedding = await aiWorker.getEmbedding(input);
      
      await saveNote({
        id: uuidv4(),
        content: input,
        embedding,
        createdAt: Date.now()
      });
      
      setInput("");
      setIsEditorOpen(false);
      refreshMemories();
    } catch (err) {
      console.error(err);
      toast('error', 'Failed to save', String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  // === Delete Note ===
  const handleDelete = async (id: string) => {
    const confirmed = await confirm('Delete Thought', 'Are you sure you want to delete this thought forever?');
    if (!confirmed) return;
    await deleteNote(id);
    setViewingNote(null);
    refreshMemories();
    toast('success', 'Thought deleted');
  };

  // === Edit Note ===
  const handleStartEdit = (note: Note) => {
    setEditingNote(note);
    setEditContent(note.content);
    setViewingNote(null);
  };

  const handleSaveEdit = async () => {
    if (!editingNote || !editContent.trim() || isProcessing) return;
    setIsProcessing(true);
    
    try {
      const embedding = await aiWorker.getEmbedding(editContent);
      await updateNote(editingNote.id, editContent, embedding);
      setEditingNote(null);
      setEditContent("");
      refreshMemories();
    } catch (err) {
      console.error(err);
      toast('error', 'Failed to update', String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  // === Clear All ===
  const handleClearAll = async () => {
    const confirmed = await confirm('Reset Brain', 'This will DELETE ALL your thoughts. This cannot be undone. Are you sure?');
    if (!confirmed) return;
    
    await clearAllNotes();
    setIsSettingsOpen(false);
    refreshMemories();
    toast('success', 'Brain reset', 'All thoughts have been cleared.');
  };

  // === Search ===
  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return;
    setIsSearching(true);
    
    try {
      const vector = await aiWorker.getEmbedding(searchQuery);
      const results = await searchSimilarNotes(vector, 10);
      setSearchResults(results.filter(r => r.score > 0.3));
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  // === Real-time Related Notes ===
  useEffect(() => {
    const timer = setTimeout(async () => {
        if (!input.trim() || input.length < 5) {
            setRelated([]);
            return;
        }
        
        try {
            const vector = await aiWorker.getEmbedding(input);
            const similar = await searchSimilarNotes(vector, 3);
            setRelated(similar.filter(r => r.score > 0.5));
        } catch (e) {
            console.error("Auto-search failed", e);
        }
    }, 500);

    return () => clearTimeout(timer);
  }, [input]);

  // === Handle Node Click from 3D Scene ===
  const handleNodeClick = (noteId: string) => {
    const note = memories.find(m => m.id === noteId);
    if (note) setViewingNote(note);
  };

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden font-sans text-white selection:bg-blue-500/30">
      
      {/* 3D Background */}
      <Suspense fallback={<LoadingSkeleton />}>
        <Scene memories={memories} edges={edges} onNodeClick={handleNodeClick} />
      </Suspense>

      {/* HUD: Header */}
      <div className="absolute top-0 left-0 p-4 sm:p-6 z-10 pointer-events-none">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-violet-600">
          SR Mesh
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium">
            <span className="text-blue-400">{memories.length}</span> Nodes • <span className="text-violet-400">{edges.length}</span> Connections
        </p>
      </div>

      {/* HUD: Settings & Help Buttons */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex gap-2">
        <button 
          onClick={() => setIsHelpOpen(true)}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all"
          title="Help & Guide"
        >
          <HelpCircle className="w-5 h-5 text-zinc-400" />
        </button>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      {/* HUD: Controls */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <button 
            onClick={() => setIsEditorOpen(true)}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl text-sm sm:text-base"
        >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium">Add Thought</span>
        </button>
        <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 rounded-full transition-all text-zinc-400 hover:text-white text-sm sm:text-base"
        >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium">Search</span>
        </button>
      </div>

      {/* ===== MODALS ===== */}

      {/* View Note Modal */}
      <AnimatePresence>
        {viewingNote && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e: React.MouseEvent) => e.target === e.currentTarget && setViewingNote(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">View Memory</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleStartEdit(viewingNote)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(viewingNote.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewingNote(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-zinc-200 text-lg leading-relaxed whitespace-pre-wrap">{viewingNote.content}</p>
              </div>
              
              <div className="p-4 border-t border-zinc-800 bg-zinc-950/30 text-xs text-zinc-500">
                Created: {new Date(viewingNote.createdAt).toLocaleString()}
                {viewingNote.updatedAt && ` • Updated: ${new Date(viewingNote.updatedAt).toLocaleString()}`}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Note Modal */}
      <AnimatePresence>
        {editingNote && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e: React.MouseEvent) => e.target === e.currentTarget && setEditingNote(null)}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                <div className="flex items-center gap-2 text-blue-400">
                  <Edit3 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Edit Memory</span>
                </div>
                <button onClick={() => setEditingNote(null)} className="text-zinc-500 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-48 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  autoFocus
                />
              </div>

              <div className="p-4 border-t border-zinc-800 flex justify-end gap-2 bg-zinc-950/30">
                <button 
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || isProcessing}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isProcessing ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e: React.MouseEvent) => e.target === e.currentTarget && setIsSettingsOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-zinc-400" />
                  <span className="font-bold">Settings</span>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="text-zinc-500 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <h3 className="font-medium mb-2">Storage Stats</h3>
                  <p className="text-sm text-zinc-400">
                    {memories.length} thoughts • {edges.length} connections
                  </p>
                </div>

                {/* Export/Import Section */}
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <h3 className="font-medium mb-3">Data Management</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={async () => {
                        const { exportData } = await import('@/lib/export-import');
                        await exportData();
                      }}
                      className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      Export JSON
                    </button>
                    <button 
                      onClick={async () => {
                        const { exportAsMarkdown } = await import('@/lib/export-import');
                        await exportAsMarkdown();
                      }}
                      className="px-3 py-2 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      Export Markdown
                    </button>
                  </div>
                  <div className="mt-3">
                    <label className="block">
                      <span className="text-xs text-zinc-500 mb-1 block">Import from backup:</span>
                      <input 
                        type="file" 
                        accept=".json"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const { importData } = await import('@/lib/export-import');
                              const count = await importData(file);
                              toast('success', 'Import successful', `Imported ${count} notes.`);
                              refreshMemories();
                            } catch (err) {
                              toast('error', 'Import failed', String(err));
                            }
                          }
                          e.target.value = '';
                        }}
                        className="w-full text-sm text-zinc-400 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-zinc-700 file:text-zinc-300 hover:file:bg-zinc-600 file:cursor-pointer cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <h3 className="font-medium">Danger Zone</h3>
                  </div>
                  <p className="text-sm text-zinc-400 mb-4">
                    This will permanently delete all your stored thoughts.
                  </p>
                  <button 
                    onClick={handleClearAll}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium text-sm transition-colors"
                  >
                    Reset Brain (Delete All)
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e: React.MouseEvent) => e.target === e.currentTarget && setIsHelpOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-linear-to-r from-blue-500/10 to-violet-500/10">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-lg">Welcome to SR Mesh</span>
                </div>
                <button onClick={() => setIsHelpOpen(false)} className="text-zinc-500 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 space-y-5 overflow-y-auto">
                {/* What is SR Mesh */}
                <div>
                  <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">What is SR Mesh?</h3>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    SR Mesh is your personal 3D knowledge graph. Every thought you add becomes a <strong>star</strong> in your galaxy, 
                    positioned based on its meaning. Similar ideas naturally cluster together, helping you discover connections 
                    you never knew existed.
                  </p>
                </div>

                {/* How to Use */}
                <div>
                  <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-2">How to Use</h3>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <p>🌟 <strong>Add Thought</strong> — Click the button at the bottom to capture a new idea</p>
                    <p>🔍 <strong>Search</strong> — Find thoughts by meaning, not just keywords</p>
                    <p>👆 <strong>Hover on stars</strong> — See the content and category of each thought</p>
                    <p>🖱️ <strong>Click on stars</strong> — View, edit, or delete any thought</p>
                    <p>🔗 <strong>Lines between stars</strong> — Show how related your thoughts are</p>
                    <p>⌨️ <strong>Press ESC</strong> — Close any modal window</p>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider mb-3">Thought Categories</h3>
                  <p className="text-xs text-zinc-500 mb-3">Each thought is automatically labeled based on its content. The label appears when you hover on a star:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-300"><strong>❓ Questions</strong> — What, how, why?</span>
                    </div>
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-300"><strong>💡 Insights</strong> — Good, bad, opinions</span>
                    </div>
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-300"><strong>📚 Facts</strong> — Definitions, data</span>
                    </div>
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-300"><strong>🎓 Learning</strong> — Study, courses</span>
                    </div>
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-300"><strong>🛠️ Projects</strong> — Build, develop</span>
                    </div>
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-300"><strong>🧑 Personal</strong> — I feel, my goals</span>
                    </div>
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-300"><strong>💼 Work</strong> — Meetings, deadlines</span>
                    </div>
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-300"><strong>💭 Ideas</strong> — What if, maybe</span>
                    </div>
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-300"><strong>🎨 Creative</strong> — Art, music, writing</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 mt-3 italic">
                    🎨 Star colors represent semantic clusters — similar thoughts share colors!
                  </p>
                </div>

                {/* AI Info */}
                <div className="p-3 bg-linear-to-r from-blue-500/10 to-violet-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-xs text-zinc-400 text-center">
                    🔒 <strong className="text-zinc-300">100% Private</strong> — All AI processing happens in your browser. No data is sent to any server.
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="w-full py-3 bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-xl font-bold text-sm transition-all"
                >
                  Got it, let&apos;s go!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Note Modal */}
      <AnimatePresence>
        {isEditorOpen && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
                onClick={(e: React.MouseEvent) => e.target === e.currentTarget && setIsEditorOpen(false)}
            >
                <div className="flex flex-col lg:flex-row gap-4 w-full max-w-4xl h-[80vh] lg:h-[500px]">
                    {/* Main Editor */}
                    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[300px]">
                        <div className="p-3 sm:p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Brain className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">New Memory</span>
                            </div>
                            <button 
                                onClick={() => setIsEditorOpen(false)}
                                className="text-zinc-500 hover:text-white transition-colors p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 p-3 sm:p-4">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your thought here..."
                                className="w-full h-full bg-transparent resize-none focus:outline-none text-base sm:text-lg placeholder:text-zinc-600"
                                autoFocus
                            />
                        </div>

                        <div className="p-3 sm:p-4 border-t border-zinc-800 flex justify-between items-center bg-zinc-950/30">
                            <span className="text-xs text-zinc-600 hidden sm:block">
                                {isProcessing ? "Vectorizing..." : "AI Ready"}
                            </span>
                            <button 
                                onClick={handleSave}
                                disabled={!input.trim() || isProcessing}
                                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-sm transition-all flex items-center gap-2 ml-auto"
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Save
                            </button>
                        </div>
                    </div>

                    {/* Related Thoughts Sidebar */}
                    <div className="w-full lg:w-[280px] bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-3 sm:p-4 flex flex-col gap-3 max-h-[200px] lg:max-h-none overflow-y-auto">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-3 h-3" /> Similar Thoughts
                        </h3>
                        
                        {related.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-zinc-700 text-sm italic text-center px-4 py-4 lg:py-0">
                                {input.length > 5 ? "No signals found..." : "Type to scan..."}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {related.map((r, i) => (
                                    <div 
                                      key={i} 
                                      className="p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors cursor-pointer group"
                                      onClick={() => {
                                        setViewingNote(r.note);
                                        setIsEditorOpen(false);
                                      }}
                                    >
                                        <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 group-hover:text-blue-200">
                                            {r.note.content}
                                        </p>
                                        <span className="text-[10px] text-zinc-500 mt-1 block">{(r.score * 100).toFixed(0)}% Match</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 pt-[10vh]"
                onClick={(e: React.MouseEvent) => e.target === e.currentTarget && setIsSearchOpen(false)}
            >
                <motion.div 
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="p-4 border-b border-zinc-800 flex gap-3 items-center">
                        <Search className="w-5 h-5 text-zinc-500" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search your thoughts semantically..."
                            className="flex-1 bg-transparent focus:outline-none text-lg placeholder:text-zinc-600"
                            autoFocus
                        />
                        <button 
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium"
                        >
                            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                        </button>
                    </div>
                    
                    <div className="max-h-[50vh] overflow-y-auto">
                        {searchResults.length === 0 ? (
                            <div className="p-8 text-center text-zinc-600 text-sm">
                                {searchQuery ? "No matching thoughts found." : "Enter a query to search your brain."}
                            </div>
                        ) : (
                            <div className="p-2">
                                {searchResults.map((r, i) => (
                                    <div 
                                      key={i} 
                                      className="p-4 m-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer border border-zinc-700/50"
                                      onClick={() => {
                                        setViewingNote(r.note);
                                        setIsSearchOpen(false);
                                      }}
                                    >
                                        <p className="text-zinc-200">{r.note.content}</p>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">{(r.score * 100).toFixed(0)}% Match</span>
                                            <span>{new Date(r.note.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
