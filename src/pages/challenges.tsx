import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { PlusIcon, UserGroupIcon, FireIcon, ShareIcon, XMarkIcon, TrophyIcon, ArrowRightIcon, FunnelIcon } from '@heroicons/react/24/solid';
import { Challenge, ChallengePhoto, User } from '@/types';
import { getChallenges, addChallenge, updateChallenge, getHabits, addHabit, getUser, initializeChallenges, formatDate } from '@/utils/storage';
import EmojiPicker from '@/components/EmojiPicker';
import { sounds } from '@/utils/sounds';
import { useRouter } from 'next/router';

const CHALLENGE_CATEGORIES = ['All', 'Fitness', 'Health', 'Learning', 'Work', 'Social', 'Creative', 'Daily', 'Mindfulness', 'Finance', 'Productivity'];

export default function Challenges() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChallengeName, setNewChallengeName] = useState('');
  const [newChallengeDesc, setNewChallengeDesc] = useState('');
  const [newChallengeEmoji, setNewChallengeEmoji] = useState('🎯');
  const [selectedHabit, setSelectedHabit] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null);
  const [showEasyChallenges, setShowEasyChallenges] = useState(false);
  const [showJoinSuccessModal, setShowJoinSuccessModal] = useState(false);
  const [joinedChallenge, setJoinedChallenge] = useState<Challenge | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const habits = getHabits();
  const user = getUser();

  useEffect(() => {
    // Initialize challenges to ensure predefined ones exist
    initializeChallenges();
    setChallenges(getChallenges());
  }, []);

  const handleCreateChallenge = () => {
    if (!newChallengeName.trim() || !selectedHabit || !user) return;

    const habit = habits.find(h => h.id === selectedHabit);
    if (!habit) return;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30-day challenge

    const newChallenge: Challenge = {
      id: `challenge_${Date.now()}`,
      name: newChallengeName,
      description: newChallengeDesc,
      habitName: habit.name,
      emoji: newChallengeEmoji,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      endDate: endDate.toISOString(),
      participants: [user.id],
      photos: [],
      status: 'active',
      category: habit.category || 'Daily',
    };

    addChallenge(newChallenge);
    setChallenges(getChallenges());
    setNewChallengeName('');
    setNewChallengeDesc('');
    setNewChallengeEmoji('🎯');
    setSelectedHabit('');
    setShowCreateModal(false);
    sounds.success();
  };

  const handleJoinChallenge = (challengeId: string) => {
    if (!user) return;
    
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.participants.includes(user.id)) return;

    // Add user to participants
    const updatedParticipants = [...challenge.participants, user.id];
    updateChallenge(challengeId, { participants: updatedParticipants });

    // Check if habit already exists for this challenge
    const existingHabits = getHabits();
    const habitExists = existingHabits.some(h => h.challengeId === challengeId);

    // Create habit if it doesn't exist
    if (!habitExists) {
      const newHabit = {
        id: `habit_${Date.now()}`,
        name: challenge.habitName,
        emoji: challenge.emoji || '🎯',
        createdAt: new Date().toISOString(),
        completedDates: [],
        photos: [],
        totalHira: 0,
        reminderTime: '09:00',
        totalDays: Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        startDate: new Date().toISOString(),
        challengeId: challengeId,
      };
      addHabit(newHabit);
    }

    setChallenges(getChallenges());
    sounds.success();

    // Navigate to leaderboard page
    router.push(`/challenge/${challengeId}`);
  };

  const isParticipating = (challenge: Challenge) => {
    return user ? challenge.participants.includes(user.id) : false;
  };

  const getParticipantCount = (challenge: Challenge) => {
    return challenge.participants.length;
  };

  // Calculate leaderboard position for a challenge
  const getChallengeLeaderboardPosition = (challenge: Challenge): { rank: number; hiraPoints: number; totalParticipants: number } => {
    if (!user) return { rank: 0, hiraPoints: 0, totalParticipants: 0 };

    const allUsers = [getUser()].filter(Boolean) as User[];
    
    // Get all participants' data
    const entries: Array<{ userId: string; hiraPoints: number }> = [];
    
    challenge.participants.forEach((participantId) => {
      const participantUser = allUsers.find(u => u.id === participantId);
      if (!participantUser) return;

      // Find the habit associated with this challenge for this participant
      const challengeHabit = habits.find(
        h => h.challengeId === challenge.id
      );

      const hiraPoints = challengeHabit?.totalHira || 0;
      entries.push({ userId: participantId, hiraPoints });
    });

    // Sort by Hira points (descending)
    entries.sort((a, b) => b.hiraPoints - a.hiraPoints);

    // Find current user's rank
    let userRank = 0;
    let userHiraPoints = 0;
    
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].userId === user.id) {
        userHiraPoints = entries[i].hiraPoints;
        // Handle ties - if previous entry has same points, use same rank
        if (i > 0 && entries[i - 1].hiraPoints === entries[i].hiraPoints) {
          // Find the first entry with this score
          let rank = i;
          for (let j = i - 1; j >= 0; j--) {
            if (entries[j].hiraPoints === entries[i].hiraPoints) {
              rank = j;
            } else {
              break;
            }
          }
          userRank = rank + 1;
        } else {
          userRank = i + 1;
        }
        break;
      }
    }

    return {
      rank: userRank,
      hiraPoints: userHiraPoints,
      totalParticipants: entries.length
    };
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  // Filter challenges
  const getFilteredChallenges = (challengeList: Challenge[]) => {
    let filtered = challengeList;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    return filtered;
  };

  const toggleShareMenu = (challengeId: string) => {
    setShowShareMenu(showShareMenu === challengeId ? null : challengeId);
  };

  const handleShareChallenge = (challenge: Challenge, platform: 'whatsapp' | 'twitter' | 'copy') => {
    const shareText = `Join me in the "${challenge.name}" challenge on Hira! ${challenge.description} 🎯\n\n${challenge.participants.length} people are already participating! 💪\n\n#HiraApp #HabitTracking`;
    const shareUrl = `${window.location.origin}/challenges?challenge=${challenge.id}`;

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=HiraApp,HabitTracking`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`).then(() => {
        alert('Challenge link copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy. Please try again.');
      });
    }
    setShowShareMenu(null);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl text-black" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>Challenges</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-500 text-white full hover:bg-blue-600 transition-all flex items-center gap-2 text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                Create
              </button>
            </div>
            
            {/* Filter Controls - Chips */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {CHALLENGE_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Quick Join Section */}
          {challenges.filter(c => c.isPredefined && !isParticipating(c)).length > 0 && (
            <div className="mb-6 bg-blue-50 2xl p-5 border border-blue-200 relative">
              <button className="absolute top-3 right-3 p-1 hover:bg-blue-100 full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex gap-3 mb-4">
                {challenges
                  .filter(c => c.isPredefined && !isParticipating(c))
                  .slice(0, 3)
                  .map((challenge) => (
                    <div key={challenge.id} className="w-16 h-16 xl bg-white border-2 border-blue-200 flex items-center justify-center text-3xl shadow-sm">
                      {challenge.emoji || '🎯'}
                    </div>
                  ))}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Join challenges <span className="underline text-blue-600">fast</span>
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Choose and join fast with these popular challenges.
              </p>
            </div>
          )}

          {/* User Created Challenges Section */}
          {user && getFilteredChallenges(challenges.filter(c => !c.isPredefined && c.createdBy === user.id)).length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">✨</span>
                <h2 className="text-lg font-bold text-gray-900">My Challenges</h2>
              </div>
              <div className="space-y-4">
                {getFilteredChallenges(challenges.filter(c => !c.isPredefined && c.createdBy === user.id))
                  .map((challenge, index) => {
                    const colors = [
                      'from-pink-500 to-rose-500',
                      'from-blue-500 to-cyan-500',
                      'from-purple-500 to-indigo-500',
                      'from-orange-500 to-amber-500',
                      'from-green-500 to-emerald-500',
                    ];
                    const colorClass = colors[index % colors.length];
                    const participating = isParticipating(challenge);
                    const leaderboardData = participating ? getChallengeLeaderboardPosition(challenge) : null;
                    const medal = leaderboardData && leaderboardData.rank > 0 ? getMedalEmoji(leaderboardData.rank) : null;
                    
                    return (
                      <div
                        key={challenge.id}
                        className="bg-white 3xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all"
                      >
                        <div className={`bg-gradient-to-r ${colorClass} 2xl p-5 mb-4 text-white`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold mb-1">{challenge.name}</h3>
                              <p className="text-sm opacity-90">{challenge.description}</p>
                            </div>
                            <div className={`px-3 py-1.5 full text-xs font-bold ${
                              challenge.status === 'active' ? 'bg-green-500 text-white' :
                              challenge.status === 'completed' ? 'bg-blue-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {challenge.status.toUpperCase()}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm mt-3">
                            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 full">
                              <span className="text-lg">👥</span>
                              <span className="font-semibold">{getParticipantCount(challenge)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 full">
                              <span className="text-lg">📅</span>
                              <span className="font-semibold">{formatDate(challenge.endDate)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 full">
                            <span className="text-lg">🎯</span>
                            <span className="text-sm font-semibold text-gray-700">{challenge.habitName}</span>
                          </div>
                        </div>


                        {participating ? (
                          <div className="space-y-3">
                            <div className={`bg-gradient-to-r ${colorClass} 2xl p-4 text-center text-white shadow-lg`}>
                              <p className="font-bold text-lg">🎉 You're participating!</p>
                              {leaderboardData && leaderboardData.rank > 0 && (
                                <div className="mt-2 flex items-center justify-center gap-2">
                                  {medal && <span className="text-2xl">{medal}</span>}
                                  <span className="text-sm font-semibold">
                                    Rank #{leaderboardData.rank} of {leaderboardData.totalParticipants}
                                  </span>
                                  {leaderboardData.hiraPoints > 0 && (
                                    <span className="text-xs opacity-90">
                                      • {leaderboardData.hiraPoints} Hira
                                    </span>
                                  )}
                                </div>
                              )}
                              <p className="text-sm opacity-90 mt-1">Keep up the great work!</p>
                            </div>
                            <button
                              onClick={() => router.push(`/challenge/${challenge.id}`)}
                              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
                            >
                              <TrophyIcon className="w-5 h-5" />
                              View Leaderboard
                            </button>
                            <div className="relative">
                              <button
                                onClick={() => toggleShareMenu(challenge.id)}
                                className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 xl hover:bg-gray-50 transition-all font-semibold flex items-center justify-center gap-2"
                                title="Share challenge"
                              >
                                <ShareIcon className="w-5 h-5" />
                                Share Challenge
                              </button>
                              {showShareMenu === challenge.id && (
                                <div className="absolute right-0 bottom-full mb-2 bg-white xl shadow-2xl p-2 z-10 min-w-[160px] border border-gray-200">
                                  <button
                                    onClick={() => {
                                handleShareChallenge(challenge, 'whatsapp');
                              }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-green-50 lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                    WhatsApp
                                  </button>
                                  <button
                                    onClick={() => {
                                handleShareChallenge(challenge, 'twitter');
                              }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                    </svg>
                                    Twitter
                                  </button>
                                  <button
                                    onClick={() => {
                                handleShareChallenge(challenge, 'copy');
                              }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                                  >
                                    <ShareIcon className="w-4 h-4" />
                                    Copy Link
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                            handleJoinChallenge(challenge.id);
                          }}
                              className={`flex-1 py-4 bg-gradient-to-r ${colorClass} text-white 2xl hover:shadow-xl transition-all font-bold text-lg transform hover:scale-105`}
                            >
                              🚀 Join Challenge
                            </button>
                            <div className="relative">
                              <button
                                onClick={() => toggleShareMenu(challenge.id)}
                                className="h-full px-4 bg-gray-100 text-gray-700 xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 font-medium"
                                title="Share challenge"
                              >
                                <ShareIcon className="w-5 h-5" />
                              </button>
                              {showShareMenu === challenge.id && (
                                <div className="absolute right-0 bottom-full mb-2 bg-white xl shadow-2xl p-2 z-10 min-w-[160px] border border-gray-200">
                                  <button
                                    onClick={() => {
                                handleShareChallenge(challenge, 'whatsapp');
                              }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-green-50 lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                    WhatsApp
                                  </button>
                                  <button
                                    onClick={() => {
                                handleShareChallenge(challenge, 'twitter');
                              }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                    </svg>
                                    Twitter
                                  </button>
                                  <button
                                    onClick={() => {
                                handleShareChallenge(challenge, 'copy');
                              }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                                  >
                                    <ShareIcon className="w-4 h-4" />
                                    Copy Link
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Most Popular Section */}
          {getFilteredChallenges(challenges.filter(c => c.isPredefined).filter(c => showEasyChallenges || isParticipating(c))).length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🔔</span>
                <h2 className="text-lg font-bold text-gray-900">Most Popular</h2>
              </div>
              <div className="space-y-3">
                {getFilteredChallenges(challenges.filter(c => c.isPredefined).filter(c => showEasyChallenges || isParticipating(c)))
                  .map((challenge) => {
                    const participating = isParticipating(challenge);
                    const leaderboardData = participating ? getChallengeLeaderboardPosition(challenge) : null;
                    const medal = leaderboardData && leaderboardData.rank > 0 ? getMedalEmoji(leaderboardData.rank) : null;
                    
                    return (
                      <div
                        key={challenge.id}
                        className="bg-white 2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon with Rating */}
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-3xl border-2 border-gray-100">
                              {challenge.emoji || '🎯'}
                            </div>
                            <div className="absolute -bottom-1 -left-1 bg-yellow-400 full px-1.5 py-0.5 flex items-center gap-0.5">
                              <span className="text-xs">⭐</span>
                              <span className="text-xs font-bold text-gray-900">4.5</span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-bold text-gray-900">{challenge.name}</h3>
                              <button
                                onClick={() => toggleShareMenu(challenge.id)}
                                className="p-1.5 hover:bg-gray-100 full transition-colors flex-shrink-0"
                              >
                                <ShareIcon className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{challenge.description}</p>
                            
                            {participating && leaderboardData && leaderboardData.rank > 0 && (
                              <div className="mb-2 flex items-center gap-2">
                                {medal && <span className="text-lg">{medal}</span>}
                                <span className="text-xs font-semibold text-gray-700">
                                  Your Rank: #{leaderboardData.rank} of {leaderboardData.totalParticipants}
                                </span>
                                {leaderboardData.hiraPoints > 0 && (
                                  <span className="text-xs text-gray-500">
                                    • {leaderboardData.hiraPoints} Hira
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {!participating && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 lg text-xs font-bold flex items-center gap-1">
                                    <span>⚡</span>
                                    5x rewards
                                  </span>
                                )}
                              </div>
                              {participating ? (
                                <button 
                                  onClick={() => router.push(`/challenge/${challenge.id}`)}
                                  className="px-5 py-2.5 bg-green-500 text-white full font-bold text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                                >
                                  <TrophyIcon className="w-4 h-4" />
                                  View Leaderboard
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                            handleJoinChallenge(challenge.id);
                          }}
                                  className="px-5 py-2.5 bg-blue-500 text-white full font-bold text-sm hover:bg-blue-600 transition-colors"
                                >
                                  Join Challenge
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {showShareMenu === challenge.id && (
                          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                            <button
                              onClick={() => {
                                handleShareChallenge(challenge, 'whatsapp');
                              }}
                              className="flex-1 px-3 py-2 bg-green-50 text-green-700 lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                              WhatsApp
                            </button>
                            <button
                              onClick={() => {
                                handleShareChallenge(challenge, 'twitter');
                              }}
                              className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                              </svg>
                              Twitter
                            </button>
                            <button
                              onClick={() => {
                                handleShareChallenge(challenge, 'copy');
                              }}
                              className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                            >
                              <ShareIcon className="w-4 h-4" />
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Community Challenges (Created by Others) */}
          {challenges.filter(c => !c.isPredefined && (!user || c.createdBy !== user.id)).length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Community Challenges</h2>
              <div className="space-y-4">
                {challenges
                  .filter(c => !c.isPredefined)
                  .map((challenge, index) => {
                    const colors = [
                      'from-pink-500 to-rose-500',
                      'from-blue-500 to-cyan-500',
                      'from-purple-500 to-indigo-500',
                      'from-orange-500 to-amber-500',
                      'from-green-500 to-emerald-500',
                    ];
                    const colorClass = colors[index % colors.length];
                    const participating = isParticipating(challenge);
                    const leaderboardData = participating ? getChallengeLeaderboardPosition(challenge) : null;
                    const medal = leaderboardData && leaderboardData.rank > 0 ? getMedalEmoji(leaderboardData.rank) : null;
                    
                    return (
                      <div
                        key={challenge.id}
                        className="bg-white 3xl p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all"
                      >
                        <div className={`bg-gradient-to-r ${colorClass} 2xl p-5 mb-4 text-white`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold mb-1">{challenge.name}</h3>
                              <p className="text-sm opacity-90">{challenge.description}</p>
                            </div>
                            <div className={`px-3 py-1.5 full text-xs font-bold ${
                              challenge.status === 'active' ? 'bg-green-500 text-white' :
                              challenge.status === 'completed' ? 'bg-blue-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {challenge.status.toUpperCase()}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm mt-3">
                            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 full">
                              <span className="text-lg">👥</span>
                              <span className="font-semibold">{getParticipantCount(challenge)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 full">
                              <span className="text-lg">📅</span>
                              <span className="font-semibold">{formatDate(challenge.endDate)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 full">
                            <span className="text-lg">🎯</span>
                            <span className="text-sm font-semibold text-gray-700">{challenge.habitName}</span>
                          </div>
                        </div>

                        {participating ? (
                          <div className="space-y-3">
                            <div className={`bg-gradient-to-r ${colorClass} 2xl p-4 text-center text-white shadow-lg`}>
                              <p className="font-bold text-lg">🎉 You're participating!</p>
                              {leaderboardData && leaderboardData.rank > 0 && (
                                <div className="mt-2 flex items-center justify-center gap-2">
                                  {medal && <span className="text-2xl">{medal}</span>}
                                  <span className="text-sm font-semibold">
                                    Rank #{leaderboardData.rank} of {leaderboardData.totalParticipants}
                                  </span>
                                  {leaderboardData.hiraPoints > 0 && (
                                    <span className="text-xs opacity-90">
                                      • {leaderboardData.hiraPoints} Hira
                                    </span>
                                  )}
                                </div>
                              )}
                              <p className="text-sm opacity-90 mt-1">Keep up the great work!</p>
                            </div>
                            <button
                              onClick={() => router.push(`/challenge/${challenge.id}`)}
                              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
                            >
                              <TrophyIcon className="w-5 h-5" />
                              View Leaderboard
                            </button>
                            <div className="relative">
                              <button
                                onClick={() => toggleShareMenu(challenge.id)}
                                className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 xl hover:bg-gray-50 transition-all font-semibold flex items-center justify-center gap-2"
                                title="Share challenge"
                              >
                                <ShareIcon className="w-5 h-5" />
                                Share Challenge
                              </button>
                              {showShareMenu === challenge.id && (
                                <div className="absolute right-0 bottom-full mb-2 bg-white xl shadow-2xl p-2 z-10 min-w-[160px] border border-gray-200">
                                  <button
                                    onClick={() => {
                                handleShareChallenge(challenge, 'whatsapp');
                              }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-green-50 lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                    WhatsApp
                                  </button>
                                  <button
                                    onClick={() => {
                                handleShareChallenge(challenge, 'twitter');
                              }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                    </svg>
                                    Twitter
                                  </button>
                                  <button
                                    onClick={() => {
                                handleShareChallenge(challenge, 'copy');
                              }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                                  >
                                    <ShareIcon className="w-4 h-4" />
                                    Copy Link
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                            handleJoinChallenge(challenge.id);
                          }}
                              className={`flex-1 py-4 bg-gradient-to-r ${colorClass} text-white 2xl hover:shadow-xl transition-all font-bold text-lg transform hover:scale-105`}
                            >
                              🚀 Join Challenge
                            </button>
                            <div className="relative">
                              <button
                                onClick={() => toggleShareMenu(challenge.id)}
                                className="h-full px-4 bg-gray-100 text-gray-700 xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 font-medium"
                                title="Share challenge"
                              >
                                <ShareIcon className="w-5 h-5" />
                              </button>
                              {showShareMenu === challenge.id && (
                                <div className="absolute right-0 bottom-full mb-2 bg-white xl shadow-2xl p-2 z-10 min-w-[160px] border border-gray-200">
                                  <button
                                    onClick={() => {
                                handleShareChallenge(challenge, 'whatsapp');
                              }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-green-50 lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                    WhatsApp
                                  </button>
                                  <button
                                    onClick={() => {
                                handleShareChallenge(challenge, 'twitter');
                              }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                    </svg>
                                    Twitter
                                  </button>
                                  <button
                                    onClick={() => {
                                handleShareChallenge(challenge, 'copy');
                              }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                                  >
                                    <ShareIcon className="w-4 h-4" />
                                    Copy Link
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Challenges List */}
          {challenges.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 full bg-gray-100 mb-4">
                <UserGroupIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No challenges yet</h3>
              <p className="text-gray-600 text-sm mb-6">Create one to get started!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-3 bg-blue-500 text-white full font-medium hover:bg-blue-600 transition-all shadow-lg"
              >
                Create Challenge
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {challenges.map((challenge, index) => {
                const colors = [
                  'from-pink-500 to-rose-500',
                  'from-blue-500 to-cyan-500',
                  'from-purple-500 to-indigo-500',
                  'from-orange-500 to-amber-500',
                  'from-green-500 to-emerald-500',
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div
                    key={challenge.id}
                    className="bg-white 3xl p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all"
                  >
                    {/* Header with gradient */}
                    <div className={`bg-gradient-to-r ${colorClass} 2xl p-5 mb-4 text-white`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">{challenge.name}</h3>
                          <p className="text-sm opacity-90">{challenge.description}</p>
                        </div>
                        <div className={`px-3 py-1.5 full text-xs font-bold ${
                          challenge.status === 'active' ? 'bg-green-500 text-white' :
                          challenge.status === 'completed' ? 'bg-blue-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {challenge.status.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm mt-3">
                        <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 full">
                          <span className="text-lg">👥</span>
                          <span className="font-semibold">{getParticipantCount(challenge)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 full">
                          <span className="text-lg">📅</span>
                          <span className="font-semibold">{formatDate(challenge.endDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Habit Badge */}
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 full">
                        <span className="text-lg">{challenge.emoji || '🎯'}</span>
                        <span className="text-sm font-semibold text-gray-700">{challenge.habitName}</span>
                      </div>
                    </div>


                    {isParticipating(challenge) ? (
                      <div className="space-y-3">
                        <div className={`bg-gradient-to-r ${colorClass} 2xl p-4 text-center text-white shadow-lg`}>
                          <p className="font-bold text-lg">🎉 You're participating!</p>
                          <p className="text-sm opacity-90 mt-1">Keep up the great work!</p>
                        </div>
                        <button
                          onClick={() => router.push(`/challenge/${challenge.id}`)}
                          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
                        >
                          <TrophyIcon className="w-5 h-5" />
                          View Leaderboard
                        </button>
                        <button
                          onClick={() => toggleShareMenu(challenge.id)}
                          className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 xl hover:bg-gray-50 transition-all font-semibold flex items-center justify-center gap-2"
                        >
                          <UserGroupIcon className="w-5 h-5" />
                          Invite Friends
                        </button>
                        {showShareMenu === challenge.id && (
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => {
                                handleShareChallenge(challenge, 'whatsapp');
                              }}
                              className="px-3 py-2 bg-green-50 text-green-700 lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                              WhatsApp
                            </button>
                            <button
                              onClick={() => {
                                handleShareChallenge(challenge, 'twitter');
                              }}
                              className="px-3 py-2 bg-blue-50 text-blue-700 lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                              </svg>
                              Twitter
                            </button>
                            <button
                              onClick={() => {
                                handleShareChallenge(challenge, 'copy');
                              }}
                              className="px-3 py-2 bg-gray-50 text-gray-700 lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                            >
                              <ShareIcon className="w-4 h-4" />
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            handleJoinChallenge(challenge.id);
                          }}
                          className={`w-full py-4 bg-gradient-to-r ${colorClass} text-white 2xl hover:shadow-xl transition-all font-bold text-lg transform hover:scale-105`}
                        >
                          🚀 Join Challenge
                        </button>
                        <button
                          onClick={() => toggleShareMenu(challenge.id)}
                          className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 xl hover:bg-gray-50 transition-all font-semibold flex items-center justify-center gap-2"
                        >
                          <UserGroupIcon className="w-5 h-5" />
                          Invite Friends
                        </button>
                        {showShareMenu === challenge.id && (
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => {
                                handleShareChallenge(challenge, 'whatsapp');
                              }}
                              className="px-3 py-2 bg-green-50 text-green-700 lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                              WhatsApp
                            </button>
                            <button
                              onClick={() => {
                                handleShareChallenge(challenge, 'twitter');
                              }}
                              className="px-3 py-2 bg-blue-50 text-blue-700 lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                              </svg>
                              Twitter
                            </button>
                            <button
                              onClick={() => {
                                handleShareChallenge(challenge, 'copy');
                              }}
                              className="px-3 py-2 bg-gray-50 text-gray-700 lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                            >
                              <ShareIcon className="w-4 h-4" />
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Create Challenge Modal */}
          {showCreateModal && (
            <div 
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
              onClick={() => {
                setShowCreateModal(false);
                setNewChallengeName('');
                setNewChallengeDesc('');
                setNewChallengeEmoji('🎯');
                setSelectedHabit('');
              }}
            >
              <div 
                className="bg-white t-3xl sm:2xl p-6 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Challenge</h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Emoji</label>
                    <div className="flex items-center gap-3">
                      <EmojiPicker selectedEmoji={newChallengeEmoji} onSelect={setNewChallengeEmoji} />
                      <p className="text-sm text-gray-500">Choose an emoji for your challenge</p>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={newChallengeName}
                      onChange={(e) => {
                        setNewChallengeName(e.target.value);
                      }}
                      placeholder="Challenge name"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <textarea
                      value={newChallengeDesc}
                      onChange={(e) => {
                        setNewChallengeDesc(e.target.value);
                      }}
                      placeholder="Description (optional)"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <select
                      value={selectedHabit}
                      onChange={(e) => {
                        setSelectedHabit(e.target.value);
                      }}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      <option value="">Choose a habit...</option>
                      {habits.map((habit) => (
                        <option key={habit.id} value={habit.id}>
                          {habit.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewChallengeName('');
                        setNewChallengeDesc('');
                        setNewChallengeEmoji('🎯');
                        setSelectedHabit('');
                      }}
                      className="flex-1 py-3.5 bg-gray-100 text-gray-700 xl hover:bg-gray-200 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateChallenge}
                      className="flex-1 py-3.5 bg-blue-500 text-white xl hover:bg-blue-600 transition-all font-medium shadow-lg"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Challenge Join Success Modal */}
          {showJoinSuccessModal && joinedChallenge && (
            <div 
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => {
                setShowJoinSuccessModal(false);
                setJoinedChallenge(null);
              }}
            >
              <div 
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowJoinSuccessModal(false);
                    setJoinedChallenge(null);
                  }}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
                </button>

                {/* Content */}
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-4">
                    <span className="text-5xl">{joinedChallenge.emoji || '🎯'}</span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Challenge Joined!</h2>
                  
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Great! The habit <span className="font-semibold text-gray-900">"{joinedChallenge.habitName}"</span> associated with this challenge has been added to your timeline in <span className="font-semibold text-blue-600">story mode</span>.
                  </p>

                  <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                    <p className="text-sm text-gray-700 font-medium">What's next?</p>
                    <div className="flex flex-col gap-3 text-left">
                      <div className="flex items-center gap-3">
                        <ShareIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <p className="text-sm text-gray-600">Share with friends to invite them</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <TrophyIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        <p className="text-sm text-gray-600">Complete habits to win rewards</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      onClick={() => {
                        handleShareChallenge(joinedChallenge, 'copy');
                        setShowJoinSuccessModal(false);
                        setJoinedChallenge(null);
                      }}
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <ShareIcon className="w-5 h-5" />
                      Share with Friends
                    </button>
                    <button
                      onClick={() => {
                        router.push('/profile');
                        setShowJoinSuccessModal(false);
                        setJoinedChallenge(null);
                      }}
                      className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                      <TrophyIcon className="w-5 h-5" />
                      View Timeline
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

