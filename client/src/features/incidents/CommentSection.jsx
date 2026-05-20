import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Send } from 'lucide-react';
import { postComment } from '../../store/slices/incidentsSlice.js';
import { Button } from '../../components/ui/Button.jsx';
import { Textarea } from '../../components/ui/Input.jsx';
import { formatRelative } from '../../utils/format.js';
import { Alert } from '../../components/ui/Alert.jsx';

function highlightMentions(text) {
  const parts = text.split(/(@[^\s@]+@[^\s@]+\.[^\s@]+)/g);
  return parts.map((part, i) =>
    part.startsWith('@') ? (
      <span
        key={i}
        className="rounded bg-indigo-100 px-1 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
      >
        {part}
      </span>
    ) : (
      part
    )
  );
}

export function CommentSection({ incidentId, comments }) {
  const dispatch = useDispatch();
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError('');
    const result = await dispatch(postComment({ incidentId, body: body.trim() }));
    if (postComment.fulfilled.match(result)) {
      setBody('');
    } else {
      setError(result.payload || 'Failed to post comment');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-900 dark:text-white">Comments</h3>

      <ul className="space-y-4">
        {comments?.map((c) => (
          <li
            key={c.id}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {c.authorName}
              </span>
              <span className="text-xs text-slate-500">{formatRelative(c.createdAt)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
              {highlightMentions(c.body)}
            </p>
          </li>
        ))}
        {!comments?.length && (
          <p className="text-sm text-slate-500">
            No comments yet. Use @email to mention teammates.
          </p>
        )}
      </ul>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <Alert variant="error">{error}</Alert>}
        <Textarea
          label="Add comment"
          placeholder="Write a comment... Mention with @user@company.com"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
        />
        <Button type="submit" loading={loading} size="sm">
          <Send className="h-4 w-4" /> Post comment
        </Button>
      </form>
    </div>
  );
}
