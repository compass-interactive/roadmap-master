import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  MessageSquare, 
  Eye, 
  Heart, 
  Calendar, 
  User,
  Pin,
  Lock,
  Reply,
  Edit,
  Trash2,
  Send,
  Share2
} from 'lucide-react';
import { 
  fetchForumPost, 
  createForumComment, 
  togglePostLike, 
  toggleCommentLike,
  deleteForumPost,
  deleteForumComment,
  ForumPost as ForumPostType,
  ForumComment
} from '@/integrations/supabase/forumApi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';

const ForumPostView = () => {
  const { postId } = useParams<{ postId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<ForumPostType | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    if (!postId) return;

    try {
      const data = await fetchForumPost(postId);
      setPost(data.post);
      setComments(data.comments);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: "Error",
        description: "Failed to load the post.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createForumComment({
        post_id: postId!,
        content: newComment.trim()
      });
      setNewComment('');
      fetchPost(); // Refresh to get the new comment
      toast({
        title: "Success",
        description: "Comment added successfully!",
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    }
  };

  const handleCreateReply = async (parentId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to reply.",
        variant: "destructive",
      });
      return;
    }

    if (!replyContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a reply.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createForumComment({
        post_id: postId!,
        content: replyContent.trim(),
        parent_id: parentId
      });
      setReplyContent('');
      setReplyingTo(null);
      fetchPost(); // Refresh to get the new reply
      toast({
        title: "Success",
        description: "Reply added successfully!",
      });
    } catch (error) {
      console.error('Error creating reply:', error);
      toast({
        title: "Error",
        description: "Failed to add reply.",
        variant: "destructive",
      });
    }
  };

  const handleLikePost = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      await togglePostLike(postId!);
      fetchPost(); // Refresh to get updated like count
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like.",
        variant: "destructive",
      });
    }
  };

  const handleSharePost = async () => {
    const postUrl = window.location.href;
    
    try {
      await navigator.clipboard.writeText(postUrl);
      toast({
        title: "Link Copied!",
        description: `"${post?.title}" link copied to clipboard.`,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = postUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Link Copied!",
        description: `"${post?.title}" link copied to clipboard.`,
      });
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like comments.",
        variant: "destructive",
      });
      return;
    }

    try {
      await toggleCommentLike(commentId);
      fetchPost(); // Refresh to get updated like count
    } catch (error) {
      console.error('Error toggling comment like:', error);
      toast({
        title: "Error",
        description: "Failed to update like.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async () => {
    if (!post || post.author_id !== user?.id) return;

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteForumPost(postId!);
      toast({
        title: "Success",
        description: "Post deleted successfully.",
      });
      navigate('/forum');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteForumComment(commentId);
      fetchPost(); // Refresh to remove the comment
      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAuthorName = (author: any, authorId: string) => {
    if (author?.name) {
      return author.name;
    }
    return `User ${authorId.slice(0, 8)}`;
  };

  const renderComment = (comment: ForumComment, isReply = false) => (
    <Card key={comment.id} className={`${isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author?.avatar} />
            <AvatarFallback className="text-xs">
              {getAuthorName(comment.author, comment.author_id).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">
                {getAuthorName(comment.author, comment.author_id)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.created_at)}
              </span>
            </div>
            <p className="text-sm mb-3">{comment.content}</p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLikeComment(comment.id)}
                className="flex items-center gap-1 text-xs"
              >
                <Heart className={`h-3 w-3 ${comment.like_count > 0 ? 'fill-current text-red-500' : ''}`} />
                {comment.like_count || 0}
              </Button>
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment.id)}
                  className="flex items-center gap-1 text-xs"
                >
                  <Reply className="h-3 w-3" />
                  Reply
                </Button>
              )}
              {user?.id === comment.author_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              )}
            </div>
            
            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={2}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleCreateReply(comment.id)}
                    className="flex items-center gap-1"
                  >
                    <Send className="h-3 w-3" />
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/forum')}>
            Back to Forum
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/forum')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Forum
        </Button>
        {user?.id === post.author_id && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeletePost}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Post
          </Button>
        )}
      </div>

      {/* Post */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {post.is_pinned && <Pin className="h-4 w-4 text-yellow-500" />}
                {post.is_locked && <Lock className="h-4 w-4 text-red-500" />}
                <CardTitle className="text-2xl">{post.title}</CardTitle>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={post.author?.avatar} />
                    <AvatarFallback className="text-xs">
                      {getAuthorName(post.author, post.author_id).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>by {getAuthorName(post.author, post.author_id)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.view_count || 0} views
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline">
                {post.category}
              </Badge>
              {post.tags.length > 0 && (
                <div className="flex gap-1">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-6">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleLikePost}
                className={`flex items-center gap-2 ${post.like_count > 0 ? 'text-red-500' : ''}`}
              >
                <Heart className={`h-5 w-5 ${post.like_count > 0 ? 'fill-current' : ''}`} />
                {post.like_count || 0} likes
              </Button>
              <Button
                variant="ghost"
                onClick={handleSharePost}
                className="flex items-center gap-2"
                title="Share post"
              >
                <Share2 className="h-5 w-5" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>
        </div>

        {/* New Comment Form */}
        {user ? (
          <Card>
            <CardContent className="pt-4">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="mb-3"
              />
              <div className="flex justify-end">
                <Button onClick={handleCreateComment}>
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-muted-foreground mb-3">
                Please log in to leave a comment.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Log In
              </Button>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => renderComment(comment))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPostView; 