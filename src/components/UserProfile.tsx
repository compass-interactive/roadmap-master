
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Edit2, Save, X } from 'lucide-react';
import { UserProfile as UserProfileType } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

interface UserProfileProps {
  user: UserProfileType;
  isEditable?: boolean;
  onSave?: (updatedUser: Partial<UserProfileType>) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  isEditable = false, 
  onSave 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const { toast } = useToast();

  const handleSave = () => {
    if (onSave) {
      onSave(editedUser);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'mentor': return 'bg-purple-100 text-purple-800';
      case 'creator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Profile</CardTitle>
          {isEditable && !isEditing && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={editedUser.avatar} alt={editedUser.name} />
              <AvatarFallback className="text-xl">
                {editedUser.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold">{editedUser.name}</h3>
              <Badge className={getRoleBadgeColor(editedUser.role)}>
                {editedUser.role}
              </Badge>
            </div>
            <p className="text-muted-foreground">{editedUser.email}</p>
            <p className="text-sm text-muted-foreground">
              Joined {new Date(editedUser.joinedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={editedUser.name}
                onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                className="mt-1"
              />
            ) : (
              <p className="text-sm mt-1">{editedUser.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={editedUser.bio || ''}
                onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                placeholder="Tell us about yourself..."
                className="mt-1"
                rows={3}
              />
            ) : (
              <p className="text-sm mt-1 text-muted-foreground">
                {editedUser.bio || 'No bio provided'}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
