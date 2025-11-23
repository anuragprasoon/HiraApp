import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { UserPlusIcon, TrophyIcon, CheckCircleIcon, FireIcon } from '@heroicons/react/24/solid';
import { Friend, Habit, Challenge } from '@/types';
import { getFriends, saveFriends, addFriend, getUser, getHabits, getChallenges, isInCurrentWeek } from '@/utils/storage';
import { sounds } from '@/utils/sounds';

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const user = getUser();
  const habits = getHabits();
  const challenges = getChallenges();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = () => {
    const friendsData = getFriends();
    // Update friend stats
    const updatedFriends = friendsData.map(friend => {
      const weeklyHira = calculateWeeklyHira(friend);
      const tasksDone = calculateTasksDone(friend);
      const challengesDone = calculateChallengesDone(friend);
      
      return {
        ...friend,
        weeklyHira,
        tasksDone,
        challengesDone,
      };
    });
    setFriends(updatedFriends);
    if (updatedFriends.length > 0) {
      saveFriends(updatedFriends);
    }
  };

  const calculateWeeklyHira = (friend: Friend): number => {
    // Simulate weekly Hira calculation
    // In a real app, this would fetch from the friend's data
    if (!friend || !friend.id) return 0;
    
    // Simulate based on friend's total Hira and activity
    const baseHira = friend.totalHira || 0;
    const weeklyMultiplier = 0.15; // Assume 15% of total is from this week
    return Math.floor(baseHira * weeklyMultiplier);
  };

  const calculateTasksDone = (friend: Friend): number => {
    // Simulate tasks done this week
    // In a real app, this would count from friend's habits
    if (!friend || !friend.id) return 0;
    
    // Simulate: 3-15 tasks per week based on activity
    // Use friend's ID as seed for consistent results
    const seed = friend.id.charCodeAt(friend.id.length - 1) || 0;
    const baseTasks = (seed % 12) + 3;
    return baseTasks;
  };

  const calculateChallengesDone = (friend: Friend): number => {
    // Count challenges the friend is participating in
    if (!friend || !friend.id) return 0;
    
    // Simulate: count active challenges
    return challenges.filter(c => c.participants.includes(friend.id)).length;
  };

  const syncContacts = async () => {
    setIsSyncing(true);
    sounds.success();
    
    // Simulate contact syncing
    // In a real app, this would use the Contacts API
    setTimeout(() => {
      const mockContacts: Friend[] = [
        {
          id: 'friend_1',
          name: 'Alex Johnson',
          phoneNumber: '+1234567890',
          totalHira: 245,
          weeklyHira: 38,
          tasksDone: 12,
          challengesDone: 3,
          joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          isSyncedFromContacts: true,
        },
        {
          id: 'friend_2',
          name: 'Sarah Chen',
          phoneNumber: '+1234567891',
          totalHira: 189,
          weeklyHira: 28,
          tasksDone: 9,
          challengesDone: 2,
          joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          isSyncedFromContacts: true,
        },
        {
          id: 'friend_3',
          name: 'Mike Rodriguez',
          phoneNumber: '+1234567892',
          totalHira: 312,
          weeklyHira: 47,
          tasksDone: 15,
          challengesDone: 4,
          joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          isSyncedFromContacts: true,
        },
        {
          id: 'friend_4',
          name: 'Emma Wilson',
          phoneNumber: '+1234567893',
          totalHira: 156,
          weeklyHira: 23,
          tasksDone: 7,
          challengesDone: 1,
          joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          isSyncedFromContacts: true,
        },
        {
          id: 'friend_5',
          name: 'David Kim',
          phoneNumber: '+1234567894',
          totalHira: 278,
          weeklyHira: 42,
          tasksDone: 13,
          challengesDone: 3,
          joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          isSyncedFromContacts: true,
        },
      ];

      // Only add new friends, don't duplicate
      const existingFriends = getFriends();
      const existingIds = new Set(existingFriends.map(f => f.id));
      const newFriends = mockContacts.filter(f => !existingIds.has(f.id));
      
      if (newFriends.length > 0) {
        const allFriends = [...existingFriends, ...newFriends];
        saveFriends(allFriends);
        setFriends(allFriends);
      } else {
        setFriends(existingFriends);
      }
      
      setIsSyncing(false);
    }, 1500);
  };

  // Sort friends by weekly Hira (winning this week)
  const sortedFriends = [...friends].sort((a, b) => b.weeklyHira - a.weeklyHira);
  const winningFriends = sortedFriends.filter(f => f.weeklyHira > 0);

  // Calculate user's stats for comparison
  const userWeeklyHira = user ? Math.floor((user.totalHira || 0) * 0.15) : 0;
  const userTasksDone = habits.reduce((count, habit) => {
    const weeklyCompletions = habit.completedDates.filter(date => isInCurrentWeek(date)).length;
    return count + weeklyCompletions;
  }, 0);
  const userChallengesDone = challenges.filter(c => c.participants.includes(user?.id || '')).length;

  return (
    <Layout>
      <div className="min-h-screen bg-white pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl text-black" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
                Friends
              </h1>
              <button
                onClick={syncContacts}
                disabled={isSyncing}
                className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlusIcon className="w-4 h-4" />
                {isSyncing ? 'Syncing...' : 'Sync Contacts'}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Stats Summary */}
          {winningFriends.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <TrophyIcon className="w-6 h-6 text-yellow-500" />
                <h2 className="text-lg font-bold text-gray-900">This Week's Leaders</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{winningFriends.length}</p>
                  <p className="text-xs text-gray-600 mt-1">Friends Winning</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {winningFriends.reduce((sum, f) => sum + f.tasksDone, 0)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Total Tasks Done</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {winningFriends.reduce((sum, f) => sum + f.challengesDone, 0)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Challenges Active</p>
                </div>
              </div>
            </div>
          )}

          {/* User's Stats Card */}
          {user && (
            <div className="mb-6 bg-white border-2 border-blue-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{user.name} (You)</h3>
                  <p className="text-xs text-gray-500">Your weekly progress</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-lg">💎</span>
                    <p className="text-xl font-bold text-gray-900">{userWeeklyHira}</p>
                  </div>
                  <p className="text-xs text-gray-500">Hira This Week</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <p className="text-xl font-bold text-gray-900">{userTasksDone}</p>
                  </div>
                  <p className="text-xs text-gray-500">Tasks Done</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FireIcon className="w-5 h-5 text-orange-500" />
                    <p className="text-xl font-bold text-gray-900">{userChallengesDone}</p>
                  </div>
                  <p className="text-xs text-gray-500">Challenges</p>
                </div>
              </div>
            </div>
          )}

          {/* Friends List */}
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <UserPlusIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Friends Yet</h3>
              <p className="text-sm text-gray-500 mb-6">
                Sync your contacts to see friends using Hira and compete with them!
              </p>
              <button
                onClick={syncContacts}
                disabled={isSyncing}
                className="px-6 py-3 bg-blue-500 text-white hover:bg-blue-600 transition-all font-medium disabled:opacity-50"
              >
                {isSyncing ? 'Syncing...' : 'Sync Contacts'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Weekly Leaderboard</h2>
              {sortedFriends.map((friend, index) => {
                const isTopThree = index < 3;
                const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                
                return (
                  <div
                    key={friend.id}
                    className={`bg-white border p-5 shadow-sm hover:shadow-md transition-all ${
                      isTopThree ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Rank/Medal */}
                      <div className="flex-shrink-0">
                        {medalEmoji ? (
                          <span className="text-3xl">{medalEmoji}</span>
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                          </div>
                        )}
                      </div>

                      {/* Friend Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                              {friend.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{friend.name}</h3>
                              {friend.isSyncedFromContacts && (
                                <p className="text-xs text-gray-500">From contacts</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <span className="text-lg">💎</span>
                              <p className="text-lg font-bold text-gray-900">{friend.weeklyHira}</p>
                            </div>
                            <p className="text-xs text-gray-500">Hira This Week</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <CheckCircleIcon className="w-5 h-5 text-green-500" />
                              <p className="text-lg font-bold text-gray-900">{friend.tasksDone}</p>
                            </div>
                            <p className="text-xs text-gray-500">Tasks Done</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <FireIcon className="w-5 h-5 text-orange-500" />
                              <p className="text-lg font-bold text-gray-900">{friend.challengesDone}</p>
                            </div>
                            <p className="text-xs text-gray-500">Challenges</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

