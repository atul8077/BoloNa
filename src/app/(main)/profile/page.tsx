"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Edit3, Grid, Info, MapPin, Briefcase, GraduationCap, Heart, Loader2, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = React.useState<'posts' | 'about'>('posts');
  const [profile, setProfile] = React.useState<any>(null);
  const [photos, setPhotos] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileData) {
          setProfile(profileData);
        }

        // Fetch Photos
        const { data: photosData, error: photosError } = await supabase
          .from('photos')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false });

        if (photosData) {
          setPhotos(photosData);
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      
      setUploading(true);

      // Compress image
      const options = {
        maxSizeMB: 0.1, // 100kb
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);

      const fileExt = compressedFile.name.split('.').pop() || 'jpg';
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      // Get public url
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);

      // Insert into photos table
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data: photoData, error: dbError } = await supabase
        .from('photos')
        .insert({
          profile_id: user.id,
          url: publicUrl,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update state
      setPhotos([photoData, ...photos]);
      toast.success("Photo posted successfully!");

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  }

  if (!profile) {
    return <div className="text-center p-8">Profile not found. Please try logging in again.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in pb-20">
      
      {/* Cover & Avatar */}
      <div className="relative h-64 md:h-80 w-full rounded-b-3xl overflow-hidden shadow-2xl bg-gray-200 dark:bg-gray-800">
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[var(--primary)]/40 to-[var(--primary)]/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Top Actions */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <Link href="/settings">
            <Button variant="outline" size="icon" className="bg-black/20 border-none text-white hover:bg-white/20 backdrop-blur-md rounded-full">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative px-4 sm:px-8 -mt-20 flex flex-col md:flex-row items-center md:items-end justify-between">
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 w-full">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[var(--background)] overflow-hidden bg-gray-200 shadow-2xl">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${profile.full_name || 'user'}`} alt="Avatar" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-[var(--background)] shadow-sm" />
          </div>

          {/* Profile Info */}
          <div className="text-center md:text-left mb-2 flex-1">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">{profile.full_name || 'New User'}</h1>
            <p className="text-[var(--primary)] font-semibold mt-1">@{profile.username || 'user'}</p>
            <p className="text-[var(--foreground)]/70 text-sm max-w-md mt-2 whitespace-pre-wrap">
              {profile.bio || "No bio added yet."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mb-2 shrink-0">
            <Link href="/profile/edit">
              <Button className="rounded-full font-bold bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)] border-none shadow-none">
                <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            </Link>
            <Link href="/premium">
              <Button className="rounded-full font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none shadow-xl shadow-orange-500/20">
                Premium
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center md:justify-start space-x-8 px-4 sm:px-8 mt-8 pb-8 border-b border-[var(--foreground)]/10">
        <div className="text-center">
          <p className="text-2xl font-bold">{photos.length}</p>
          <p className="text-xs text-[var(--foreground)]/60 font-medium uppercase tracking-wider">Posts</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-[var(--foreground)]/60 font-medium uppercase tracking-wider">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-[var(--foreground)]/60 font-medium uppercase tracking-wider">Following</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center space-x-12 mt-6 mb-6">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`flex items-center space-x-2 pb-2 border-b-2 font-medium transition-colors ${activeTab === 'posts' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--foreground)]/50 hover:text-[var(--foreground)]'}`}
        >
          <Grid className="w-5 h-5" /> <span>Photos</span>
        </button>
        <button 
          onClick={() => setActiveTab('about')}
          className={`flex items-center space-x-2 pb-2 border-b-2 font-medium transition-colors ${activeTab === 'about' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--foreground)]/50 hover:text-[var(--foreground)]'}`}
        >
          <Info className="w-5 h-5" /> <span>About</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-8">
        
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Add Photo Action */}
            <div className="flex justify-end">
              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-full shadow-lg bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                >
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  {uploading ? "Uploading..." : "Add Photo"}
                </Button>
              </div>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-12 text-[var(--foreground)]/50">
                <Grid className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No photos yet.</p>
                <p className="text-sm">Upload a photo to share with your friends!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative bg-gray-100 dark:bg-gray-800">
                    <img src={photo.url} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-4">
            <Card className="border-none shadow-md bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full"><MapPin className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]/60">Location</p>
                    <p className="font-semibold text-lg">{[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full"><Briefcase className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]/60">Occupation</p>
                    <p className="font-semibold text-lg">{profile.occupation || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full"><GraduationCap className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]/60">Education</p>
                    <p className="font-semibold text-lg">{profile.education || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full"><Heart className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]/60">Relationship Status</p>
                    <p className="font-semibold text-lg">{profile.relationship_status || 'Not specified'}</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}
      </div>

    </div>
  );
}

