import { supabase } from "./client";

// Types
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category: string;
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    name: string;
    avatar: string;
  };
  comment_count?: number;
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  like_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    name: string;
    avatar: string;
  };
  replies?: ForumComment[];
}

export interface ForumLike {
  id: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
  created_at: string;
}

// Fetch all forum posts with author information
export async function fetchForumPosts(category?: string) {
  try {
    console.log('Fetching forum posts with category:', category);
    
    // First, try to fetch posts with user join
    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        author:author_id (
          id,
          name,
          avatar
        )
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching forum posts with join:', error);
      
      // If join fails, try fetching posts without user data
      console.log('Trying to fetch posts without user join...');
      let fallbackQuery = supabase
        .from('forum_posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        fallbackQuery = fallbackQuery.eq('category', category);
      }

      const { data: fallbackData, error: fallbackError } = await fallbackQuery;
      
      if (fallbackError) {
        console.error('Error fetching forum posts without join:', fallbackError);
        throw fallbackError;
      }
      
      console.log('Successfully fetched forum posts without user data:', fallbackData);
      return fallbackData || [];
    }
    
    console.log('Successfully fetched forum posts with user data:', data);
    return data || [];
  } catch (error) {
    console.error('Exception in fetchForumPosts:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
}

// Fetch a single forum post with comments
export async function fetchForumPost(postId: string) {
  try {
    console.log('Fetching forum post with ID:', postId);
    
    // First, try to fetch post with user join
    const { data: post, error: postError } = await supabase
      .from('forum_posts')
      .select(`
        *,
        author:author_id (
          id,
          name,
          avatar
        )
      `)
      .eq('id', postId)
      .single();

    if (postError) {
      console.error('Error fetching post with join:', postError);
      
      // If join fails, try fetching post without user data
      console.log('Trying to fetch post without user join...');
      const { data: fallbackPost, error: fallbackPostError } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (fallbackPostError) {
        console.error('Error fetching post without join:', fallbackPostError);
        throw fallbackPostError;
      }

      console.log('Successfully fetched post without user data:', fallbackPost);
      
      // Increment view count
      await supabase
        .from('forum_posts')
        .update({ view_count: (fallbackPost.view_count || 0) + 1 })
        .eq('id', postId);

      // Fetch comments without user data
      const { data: comments, error: commentsError } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const { data: replies } = await supabase
            .from('forum_comments')
            .select('*')
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });

          return {
            ...comment,
            replies: replies || []
          };
        })
      );

      return {
        post: fallbackPost,
        comments: commentsWithReplies
      };
    }

    // If post fetch with join succeeded, increment view count
    await supabase
      .from('forum_posts')
      .update({ view_count: (post.view_count || 0) + 1 })
      .eq('id', postId);

    // Fetch comments with user data
    const { data: comments, error: commentsError } = await supabase
      .from('forum_comments')
      .select(`
        *,
        author:author_id (
          id,
          name,
          avatar
        )
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Error fetching comments with join:', commentsError);
      
      // If comments join fails, try without user data
      console.log('Trying to fetch comments without user join...');
      const { data: fallbackComments, error: fallbackCommentsError } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (fallbackCommentsError) throw fallbackCommentsError;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        fallbackComments.map(async (comment) => {
          const { data: replies } = await supabase
            .from('forum_comments')
            .select('*')
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });

          return {
            ...comment,
            replies: replies || []
          };
        })
      );

      return {
        post,
        comments: commentsWithReplies
      };
    }

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const { data: replies } = await supabase
          .from('forum_comments')
          .select(`
            *,
            author:author_id (
              id,
              name,
              avatar
            )
          `)
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true });

        return {
          ...comment,
          replies: replies || []
        };
      })
    );

    console.log('Successfully fetched post with user data:', post);
    return {
      post,
      comments: commentsWithReplies
    };
  } catch (error) {
    console.error('Exception in fetchForumPost:', error);
    throw error;
  }
}

// Create a new forum post
export async function createForumPost(post: {
  title: string;
  content: string;
  category: string;
  tags?: string[];
}) {
  try {
    console.log('Creating forum post:', post);
    
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('forum_posts')
      .insert([{
        ...post,
        author_id: user.id,
        tags: post.tags || []
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating forum post:', error);
      throw error;
    }

    console.log('Successfully created forum post:', data);
    return data;
  } catch (error) {
    console.error('Exception in createForumPost:', error);
    throw error;
  }
}

// Create a new comment
export async function createForumComment(comment: {
  post_id: string;
  content: string;
  parent_id?: string;
}) {
  const { data, error } = await supabase
    .from('forum_comments')
    .insert([{
      ...comment,
      author_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a forum post
export async function updateForumPost(postId: string, updates: Partial<ForumPost>) {
  const { data, error } = await supabase
    .from('forum_posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a comment
export async function updateForumComment(commentId: string, updates: Partial<ForumComment>) {
  const { data, error } = await supabase
    .from('forum_comments')
    .update(updates)
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a forum post
export async function deleteForumPost(postId: string) {
  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
}

// Delete a comment
export async function deleteForumComment(commentId: string) {
  const { error } = await supabase
    .from('forum_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
}

// Toggle like on a post
export async function togglePostLike(postId: string) {
  try {
    console.log('Toggling like for post:', postId);
    
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    console.log('User authenticated:', user.id);

    // Check if already liked - let's see all likes for this user
    const { data: allUserLikes, error: allLikesError } = await supabase
      .from('forum_likes')
      .select('*')
      .eq('user_id', user.id);

    console.log('All likes for this user:', allUserLikes);
    console.log('All likes error:', allLikesError);

    // Check if already liked for this specific post
    const { data: existingLike, error: checkError } = await supabase
      .from('forum_likes')
      .select('*')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error if no record found

    if (checkError) {
      console.error('Error checking existing like:', checkError);
      throw checkError;
    }

    console.log('Existing like found for this post:', existingLike);

    if (existingLike) {
      // Unlike
      console.log('Removing like with ID:', existingLike.id);
      const { error: deleteError } = await supabase
        .from('forum_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        console.error('Error deleting like:', deleteError);
        throw deleteError;
      }

      // Get current like count and decrement
      const { data: currentPost, error: getError } = await supabase
        .from('forum_posts')
        .select('like_count')
        .eq('id', postId)
        .single();

      if (getError) {
        console.error('Error getting current like count:', getError);
        throw getError;
      }

      const newLikeCount = Math.max((currentPost.like_count || 0) - 1, 0);
      
      const { error: updateError } = await supabase
        .from('forum_posts')
        .update({ like_count: newLikeCount })
        .eq('id', postId);

      if (updateError) {
        console.error('Error updating like count:', updateError);
        throw updateError;
      }

      console.log('Like removed successfully, new count:', newLikeCount);
      return false; // unliked
    } else {
      // Like
      console.log('Adding like for user:', user.id, 'post:', postId);
      const { error: insertError } = await supabase
        .from('forum_likes')
        .insert([{
          user_id: user.id,
          post_id: postId
        }]);

      if (insertError) {
        console.error('Error inserting like:', insertError);
        throw insertError;
      }

      // Get current like count and increment
      const { data: currentPost, error: getError } = await supabase
        .from('forum_posts')
        .select('like_count')
        .eq('id', postId)
        .single();

      if (getError) {
        console.error('Error getting current like count:', getError);
        throw getError;
      }

      const newLikeCount = (currentPost.like_count || 0) + 1;
      
      const { error: updateError } = await supabase
        .from('forum_posts')
        .update({ like_count: newLikeCount })
        .eq('id', postId);

      if (updateError) {
        console.error('Error updating like count:', updateError);
        throw updateError;
      }

      console.log('Like added successfully, new count:', newLikeCount);
      return true; // liked
    }
  } catch (error) {
    console.error('Exception in togglePostLike:', error);
    throw error;
  }
}

// Toggle like on a comment
export async function toggleCommentLike(commentId: string) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  // Check if already liked
  const { data: existingLike } = await supabase
    .from('forum_likes')
    .select('*')
    .eq('user_id', user.id)
    .eq('comment_id', commentId)
    .single();

  if (existingLike) {
    // Unlike
    await supabase
      .from('forum_likes')
      .delete()
      .eq('id', existingLike.id);

    // Decrement like count
    await supabase
      .from('forum_comments')
      .update({ like_count: supabase.sql`like_count - 1` })
      .eq('id', commentId);

    return false; // unliked
  } else {
    // Like
    await supabase
      .from('forum_likes')
      .insert([{
        user_id: user.id,
        comment_id: commentId
      }]);

    // Increment like count
    await supabase
      .from('forum_comments')
      .update({ like_count: supabase.sql`like_count + 1` })
      .eq('id', commentId);

    return true; // liked
  }
}

// Get forum categories
export async function getForumCategories() {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('category')
    .not('category', 'is', null);

  if (error) throw error;

  const categories = [...new Set(data.map(post => post.category))];
  return categories;
}

// Test function to check if forum tables exist
export async function testForumTables() {
  try {
    console.log('Testing forum tables...');
    
    // Test if forum_posts table exists
    const { data: postsTest, error: postsError } = await supabase
      .from('forum_posts')
      .select('count')
      .limit(1);
    
    console.log('forum_posts table test:', { data: postsTest, error: postsError });
    
    // Test if forum_comments table exists
    const { data: commentsTest, error: commentsError } = await supabase
      .from('forum_comments')
      .select('count')
      .limit(1);
    
    console.log('forum_comments table test:', { data: commentsTest, error: commentsError });
    
    // Test if forum_likes table exists
    const { data: likesTest, error: likesError } = await supabase
      .from('forum_likes')
      .select('count')
      .limit(1);
    
    console.log('forum_likes table test:', { data: likesTest, error: likesError });
    
    return {
      postsTable: !postsError,
      commentsTable: !commentsError,
      likesTable: !likesError,
      errors: {
        posts: postsError,
        comments: commentsError,
        likes: likesError
      }
    };
  } catch (error) {
    console.error('Error testing forum tables:', error);
    return {
      postsTable: false,
      commentsTable: false,
      likesTable: false,
      errors: { general: error }
    };
  }
}

// Test function to fetch posts without any filters (for debugging RLS)
export async function testFetchPosts() {
  try {
    console.log('Testing raw post fetch...');
    
    // Try to fetch all posts without any joins
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .limit(10);
    
    console.log('Raw posts fetch result:', { data, error });
    
    // Try to fetch with count
    const { count, error: countError } = await supabase
      .from('forum_posts')
      .select('*', { count: 'exact', head: true });
    
    console.log('Posts count result:', { count, error: countError });
    
    return { data, error, count, countError };
  } catch (error) {
    console.error('Error in testFetchPosts:', error);
    return { error };
  }
}

// Test function to check like functionality
export async function testLikeFunctionality(postId: string) {
  try {
    console.log('Testing like functionality for post:', postId);
    
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      console.log('No authenticated user found');
      return { error: 'No authenticated user' };
    }
    
    console.log('User authenticated:', user.id);
    
    // Test 1: Check if forum_likes table exists and can be queried
    const { data: likesTest, error: likesTestError } = await supabase
      .from('forum_likes')
      .select('*')
      .limit(1);
    
    console.log('forum_likes table test:', { data: likesTest, error: likesTestError });
    
    // Test 2: Try to insert a like
    const { data: insertTest, error: insertError } = await supabase
      .from('forum_likes')
      .insert([{
        user_id: user.id,
        post_id: postId
      }])
      .select();
    
    console.log('Like insert test:', { data: insertTest, error: insertError });
    
    // Test 3: Check current like count
    const { data: postData, error: postError } = await supabase
      .from('forum_posts')
      .select('like_count')
      .eq('id', postId)
      .single();
    
    console.log('Current like count:', { data: postData, error: postError });
    
    return {
      likesTableTest: { data: likesTest, error: likesTestError },
      insertTest: { data: insertTest, error: insertError },
      likeCount: { data: postData, error: postError }
    };
  } catch (error) {
    console.error('Error in testLikeFunctionality:', error);
    return { error };
  }
} 