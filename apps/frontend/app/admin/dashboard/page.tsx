'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Edit, Trash2, LogOut, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { getPosts, deleteBlogPost } from '@/lib/data';
import type { BlogPost } from '@/lib/types';

export default function AdminDashboardPage() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { showSuccess, showError } = useToastNotifications();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchPosts();
    }
  }, [isAuthenticated, authLoading]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError('');
      const fetchedPosts = await getPosts(true); // Pass true for admin to get all posts
      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load blog posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (postId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(postId);
      const success = await deleteBlogPost(postId);

      if (success) {
        setPosts((prev: BlogPost[]) => prev.filter((post: BlogPost) => post.id !== postId));
        showSuccess('Blog post deleted successfully', `"${title}" has been removed from your blog.`);
      } else {
        setError('Failed to delete the blog post. Please try again.');
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      setError('Failed to delete the blog post. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // useRequireAuth will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your blog posts</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </Link>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Blog Posts</CardTitle>
            <CardDescription>
              A list of all your blog posts. You can create, edit, or delete posts from here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading posts...</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No blog posts found.</p>
                <Link href="/admin/dashboard/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Post
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Last Saved</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post: BlogPost) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate" title={post.title}>
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs" title={post.summary}>
                            {post.summary}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              post.status === 'published' ? 'default' :
                              post.status === 'scheduled' ? 'outline' :
                              post.status === 'hidden' ? 'destructive' : 'secondary'
                            }
                          >
                            {post.status === 'published' ? 'Published' :
                             post.status === 'scheduled' ? 'Scheduled' :
                             post.status === 'hidden' ? 'Hidden' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {post.status === 'scheduled' && post.scheduledPublishDate
                            ? formatDate(post.scheduledPublishDate)
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{post.viewCount.toLocaleString()}</TableCell>
                        <TableCell>{post.likeCount.toLocaleString()}</TableCell>
                        <TableCell>
                          {post.lastSavedAt ? formatDate(post.lastSavedAt) : formatDate(post.publicationDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link href={`/post/${post.id}`} target="_blank">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/dashboard/edit/${post.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(post.id, post.title)}
                              disabled={deletingId === post.id}
                            >
                              {deletingId === post.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
