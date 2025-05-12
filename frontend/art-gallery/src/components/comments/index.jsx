import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Heart, Pencil, Trash2, Check, X } from "lucide-react";
import "./index.scss";

const CommentsPanel = ({ artID, userID }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const commentsEndRef = useRef(null);

  const fetchComments = async () => {
    if (!artID || !userID) return;

    try {
      const res = await axios.get(`http://localhost:8000/comments/${artID}`, {
        params: { user_id: userID },
      });
      setComments(res.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    if (isOpen && artID) fetchComments();
  }, [isOpen, artID]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSend = async () => {
    if (!newComment.trim()) return;

    const payload = {
      artwork_id: artID,
      user_id: userID,
      text: newComment,
    };

    try {
      await axios.post("http://localhost:8000/comments", payload);
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleHeart = async (index) => {
    const comment = comments[index];
    try {
      await axios.post(
        `http://localhost:8000/comments/${comment.id}/like`,
        null,
        { params: { user_id: userID } }
      );
      const updated = [...comments];
      updated[index].liked = !updated[index].liked;
      updated[index].like_count += updated[index].liked ? 1 : -1;
      setComments(updated);
    } catch (err) {
      console.error("Failed to like comment:", err);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await axios.delete(`http://localhost:8000/comments/${commentId}`, {
        params: { user_id: userID },
      });
      fetchComments(); // refresh the list
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const startEdit = (index, text) => {
    setEditingIndex(index);
    setEditText(text);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  const saveEdit = async (commentId) => {
    try {
      await axios.put(`http://localhost:8000/comments/${commentId}`, {
        user_id: userID,
        text: editText,
      });
      cancelEdit();
      fetchComments();
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  return (
    <div className="comments-drawer-wrapper">
      <div className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        comments
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="comments-drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
          >
            <div className="comments-list">
              {comments.map((c, i) => (
                <div
                  key={i}
                  className={`comment ${c.is_author ? "author-comment" : ""}`}
                >
                  <div className="comment-header">
                    <span className="user">
                      {c.user}
                      {c.is_author && (
                        <span className="author-badge">Artist</span>
                      )}
                    </span>
                    <div className="comment-actions">
                      <div
                        className="heart-container"
                        onClick={() => handleHeart(i)}
                      >
                        <Heart
                          size={18}
                          strokeWidth={1.8}
                          fill={c.liked ? "#ff4f81" : "none"}
                          color={c.liked ? "#ff4f81" : "#aaa"}
                        />
                        <span className="count">{c.like_count}</span>
                      </div>
                      {c.user_id == userID && editingIndex !== i && (
                        <button
                          className="edit-btn"
                          onClick={() => startEdit(i, c.text)}
                        >
                          <Pencil size={16} />
                        </button>
                      )}

                      {c.user_id == userID && (
                        <button
                          className="delete-btn"
                          onClick={() => {
                            setDeleteTargetId(c.id);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  {editingIndex === i ? (
                    <div className="edit-controls">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="edit-input"
                      />
                      <button onClick={() => saveEdit(c.id)}>
                        <Check size={16} />
                      </button>
                      <button onClick={() => cancelEdit()}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <p>{c.text}</p>
                  )}
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>

            <div className="comment-input">
              <input
                type="text"
                placeholder="Enter your comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend}>▶</button>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal"
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
              >
                <p>Are you sure you want to delete this comment?</p>
                <div className="modal-buttons">
                  <button
                    className="confirm"
                    onClick={() => {
                      handleDelete(deleteTargetId);
                      setShowDeleteModal(false);
                    }}
                  >
                    <Check size={18} />
                  </button>
                  <button
                    className="cancel"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    <X size={18} />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
};

export default CommentsPanel;
