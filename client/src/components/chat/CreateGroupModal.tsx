import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { createGroupChat } from '@/features/chat/chatSlice';
import { X, Users, Search, Check, Loader2 } from 'lucide-react';
import Avatar from '../ui/Avatar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const dispatch = useAppDispatch();

  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsSearching(true);
        const endpoint = searchQuery.trim().length >= 1 ? `/users/search?q=${searchQuery}` : `/users/search?q=a`;
        const { data } = await api.get(endpoint);
        setSearchResults(data.data || []);
      } catch (err) {
        console.error('Failed to search users for group:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  const toggleUserSelection = (user: any) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error('Group name is required');
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one member for the group');
      return;
    }

    try {
      setIsSubmitting(true);
      await dispatch(
        createGroupChat({
          groupName: groupName.trim(),
          groupDescription: groupDescription.trim(),
          members: selectedUsers.map((u) => u._id),
        }),
      ).unwrap();

      toast.success('Group chat created successfully!');
      // Reset and close
      setGroupName('');
      setGroupDescription('');
      setSelectedUsers([]);
      setSearchQuery('');
      onClose();
    } catch (err: any) {
      toast.error(err || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800 bg-surface-850/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary-500/10 rounded-xl text-primary-400">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-surface-100">Create New Group</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
          {/* Group Name input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-1.5">
              Group Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Project Avengers"
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-400 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>

          {/* Group Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="What's this group about?"
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-400 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>

          {/* Member Selection Section */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-1.5">
              Add Members ({selectedUsers.length} selected)
            </label>

            {/* Selected members tags */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5 max-h-24 overflow-y-auto p-1">
                {selectedUsers.map((user) => (
                  <span
                    key={user._id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-500/20 text-primary-300 border border-primary-500/30 rounded-full text-xs font-medium"
                  >
                    {user.displayName || user.username}
                    <button
                      type="button"
                      onClick={() => toggleUserSelection(user)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search members input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users to add..."
                className="w-full pl-10 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-400 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* User Search List */}
            <div className="mt-2 max-h-40 overflow-y-auto space-y-1 rounded-xl bg-surface-850 p-1 border border-surface-800">
              {isSearching ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                </div>
              ) : searchQuery.trim().length >= 2 && searchResults.length === 0 ? (
                <p className="text-xs text-surface-400 text-center py-3">No users found</p>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => {
                  const isSelected = selectedUsers.some((u) => u._id === user._id);
                  return (
                    <div
                      key={user._id}
                      onClick={() => toggleUserSelection(user)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary-500/15' : 'hover:bg-surface-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar src={user.avatar} name={user.displayName || user.username} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-surface-100">
                            {user.displayName || user.username}
                          </p>
                          <p className="text-xxs text-surface-400">@{user.username}</p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          isSelected
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'border-surface-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-surface-400 text-center py-3">
                  No users found
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-surface-300 hover:bg-surface-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !groupName.trim() || selectedUsers.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-600/20"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
