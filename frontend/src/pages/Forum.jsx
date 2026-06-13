/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Community Forum — dark-first Tailwind, fully responsive.
*/
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { MessageSquare, User as UserIcon, Send, Clock, AlertCircle, X } from "lucide-react";
import { useUser } from "../context/UserContext";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Forum() {
  const { user } = useUser();
  const { t } = useTranslation();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAskModal, setShowAskModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/forum`, { withCredentials: true });
      setQuestions(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAsk = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`${BASE_URL}/api/forum`, { title: newTitle, content: newContent }, { withCredentials: true });
      setShowAskModal(false);
      setNewTitle(""); setNewContent("");
      fetchQuestions();
    } catch { alert("Please log in to ask a question."); }
    finally { setSubmitting(false); }
  };

  const openQuestion = async (id) => {
    if (expandedId === id) { setExpandedId(null); setActiveQuestion(null); return; }
    setExpandedId(id);
    try {
      const res = await axios.get(`${BASE_URL}/api/forum/${id}`, { withCredentials: true });
      setActiveQuestion(res.data);
    } catch (e) { console.error(e); }
  };

  const handleReply = async (id) => {
    if (!replyContent.trim()) return;
    setReplying(true);
    try {
      await axios.post(`${BASE_URL}/api/forum/${id}/reply`, { content: replyContent }, { withCredentials: true });
      setReplyContent("");
      const res = await axios.get(`${BASE_URL}/api/forum/${id}`, { withCredentials: true });
      setActiveQuestion(res.data);
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, replyCount: q.replyCount + 1 } : q));
    } catch { alert("Please log in to reply."); }
    finally { setReplying(false); }
  };

  const timeAgo = (dateStr) => {
    const d = new Date(dateStr);
    const diff = (new Date() - d) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  };

  return (
    <>
      <Helmet>
        <title>{t("auto.auto_162", "Community Forum — TerraSpotter")}</title>
        <meta name="description" content="Ask questions, share advice, and connect with the TerraSpotter community." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground py-8 pb-24">
        <div className="max-w-[880px] mx-auto px-4 md:px-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {t("auto.auto_163", "Live Q&A")}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-none mb-2">
                {t("auto.auto_164", "Community Forum")}
              </h1>
              <p className="text-muted-foreground text-[15px]">
                {t("auto.auto_165", "Ask for advice, discuss planting methods, or help out fellow members.")}
              </p>
            </div>
            <button
              onClick={() => { if (!user) return alert("Please log in to ask a question."); setShowAskModal(true); }}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all whitespace-nowrap self-start md:self-end shadow-lg shadow-primary/25 flex items-center gap-2">
              <MessageSquare size={16} /> {t("auto.auto_166", "Ask a Question")}
            </button>
          </div>

          {/* Questions list */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse" />
                ))}
              </div>
            ) : questions.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare size={48} className="opacity-20 mb-4" />
                <p className="text-lg font-medium text-foreground">{t("auto.auto_167", "No questions yet.")}</p>
                <p className="text-sm">{t("auto.auto_168", "Be the first to start a discussion!")}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {questions.map((q) => (
                  <div key={q.id} className="transition-colors hover:bg-secondary/50">
                    <div className="p-5 md:p-6 cursor-pointer flex gap-4" onClick={() => openQuestion(q.id)}>
                      <div className="hidden sm:flex flex-col items-center min-w-[50px] gap-1">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary">
                          {q.authorAvatar ? (
                            <img src={q.authorAvatar} alt="user" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-full h-full p-2 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-[17px] font-semibold text-foreground leading-tight pr-4">{q.title}</h3>
                          <div className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                            <Clock size={12} /> {timeAgo(q.createdAt)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-3">{q.content}</p>
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-1.5"><UserIcon size={13} /> {q.authorName}</span>
                          <span className="flex items-center gap-1.5"><MessageSquare size={13} /> {q.replyCount} Replies</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Section */}
                    {expandedId === q.id && activeQuestion && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-background border-t border-border p-5 md:p-6 md:pl-20 relative">
                        <div className="absolute left-10 top-0 bottom-0 w-px bg-border hidden sm:block" />
                        <div className="mb-6 relative z-10">
                          <p className="text-[15px] text-foreground whitespace-pre-wrap leading-relaxed">{activeQuestion.content}</p>
                        </div>
                        <div className="space-y-6 mb-6">
                          {activeQuestion.replies.map(r => (
                            <div key={r.id} className="flex gap-3 relative z-10">
                              <div className="w-8 h-8 shrink-0 rounded-full bg-primary/20 border-2 border-background shadow-sm overflow-hidden flex items-center justify-center -ml-1 sm:ml-0">
                                {r.authorAvatar
                                  ? <img src={r.authorAvatar} alt="avatar" className="w-full h-full object-cover" />
                                  : <UserIcon size={14} className="text-primary" />}
                              </div>
                              <div className="bg-card border border-border text-sm rounded-2xl rounded-tl-none px-4 py-3 flex-1">
                                <div className="flex justify-between items-center mb-1 text-xs">
                                  <span className="font-semibold text-primary">{r.authorName}</span>
                                  <span className="text-muted-foreground">{timeAgo(r.createdAt)}</span>
                                </div>
                                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{r.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="relative z-10 mt-6 pt-4 border-t border-border">
                          {user ? (
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden shrink-0 hidden sm:block">
                                {user.profilePictureUrl ? <img src={user.profilePictureUrl} alt="me" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-1 text-muted-foreground" />}
                              </div>
                              <div className="flex-1 rounded-xl bg-card border border-border p-1 flex items-end">
                                <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)}
                                  placeholder="Write a reply... Please be respectful."
                                  className="w-full p-2 text-sm outline-none bg-transparent resize-none h-[40px] focus:h-[80px] transition-all text-foreground placeholder:text-muted-foreground" />
                                <button disabled={replying || !replyContent.trim()} onClick={() => handleReply(q.id)}
                                  className="m-1 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                  <Send size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-card border border-border px-4 py-3 rounded-xl text-sm flex justify-between items-center">
                              <span className="text-muted-foreground">{t("auto.auto_169", "Log in to leave a reply.")}</span>
                              <a href="/login" className="font-semibold text-primary hover:underline">{t("auto.auto_170", "Log in")}</a>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ASK MODAL */}
        <AnimatePresence>
          {showAskModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowAskModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-foreground">{t("auto.auto_171", "Ask the Community")}</h2>
                  <button onClick={() => setShowAskModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex items-start gap-2 text-xs text-primary bg-primary/10 border border-primary/20 p-3 rounded-lg mb-4">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <p>{t("auto.auto_172", "Inappropriate language is monitored and strictly prohibited. Please keep discussions civil and on-topic.")}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{t("auto.auto_173", "Question Title")}</label>
                    <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                      placeholder="e.g., Which native species is best for black soil?"
                      className="w-full border border-border bg-background text-foreground p-3 rounded-xl text-sm focus:border-primary outline-none placeholder:text-muted-foreground"
                      maxLength={150} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{t("auto.auto_174", "Details")}</label>
                    <textarea value={newContent} onChange={e => setNewContent(e.target.value)}
                      placeholder="Provide more context..."
                      className="w-full border border-border bg-background text-foreground p-3 rounded-xl text-sm min-h-[140px] resize-none focus:border-primary outline-none placeholder:text-muted-foreground" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setShowAskModal(false)} className="px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    {t("auto.auto_175", "Cancel")}
                  </button>
                  <button disabled={submitting || !newTitle.trim() || !newContent.trim()} onClick={handleAsk}
                    className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-all">
                    {submitting ? "Posting..." : "Post Question"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
