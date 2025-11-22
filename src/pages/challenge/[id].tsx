import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { ArrowLeftIcon, TrophyIcon, UserGroupIcon, ShareIcon, FireIcon } from '@heroicons/react/24/solid';
import { Challenge, Habit, User } from '@/types';
import { getHabits, getUser, formatDate, getChallenges } from '@/utils/storage';

interface LeaderboardEntry {
  userId: string;
  userName: string;
  userPhoto?: string;
  hiraPoints: number;
  completions: number;
  rank: number;
}

export default function ChallengeLeaderboard() {
  const router = useRouter();
  const { id } = router.query;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const challengeData = getChallenges().find(c => c.id === id);
    if (!challengeData) {
      router.push('/challenges');
      return;
    }

    setChallenge(challengeData);
    setCurrentUser(getUser());

    // Calculate leaderboard
    const habits = getHabits();
    const allUsers = [getUser()].filter(Boolean) as User[];
    const entries: LeaderboardEntry[] = [];

    challengeData.participants.forEach((participantId, index) => {
      const user = allUsers.find(u => u.id === participantId);
      if (!user) return;

      // Find the habit associated with this challenge for this user
      const challengeHabit = habits.find(
        h => h.challengeId === challengeData.id
      );

      const hiraPoints = challengeHabit?.totalHira || 0;
      const completions = challengeHabit?.completedDates.length || 0;

      entries.push({
        userId: user.id,
        userName: user.name,
        userPhoto: user.profilePhoto,
        hiraPoints,
        completions,
        rank: 0, // Will be set after sorting
      });
    });

    // Sort by Hira points (descending)
    entries.sort((a, b) => b.hiraPoints - a.hiraPoints);

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
      // If tied with previous, use same rank
      if (index > 0 && entries[index - 1].hiraPoints === entry.hiraPoints) {
        entry.rank = entries[index - 1].rank;
      }
    });

    setLeaderboard(entries);
    setLoading(false);
  }, [id, router]);

  if (loading || !challenge) {
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600';
    return 'bg-gray-200';
  };

  const currentUserEntry = leaderboard.find(e => e.userId === currentUser?.id);
  const participantCount = leaderboard.length;

  return (
    <Layout>
      <div className="min-h-screen bg-white pb-24">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>

            {/* Challenge Info */}
            <div className="flex items-start gap-4">
              <div className="text-6xl">{challenge.emoji || '🎯'}</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {challenge.name}
                </h1>
                <p className="text-gray-600 mb-3 leading-relaxed">
                  {challenge.description}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5" />
                    <span className="font-medium">{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FireIcon className="w-5 h-5" />
                    <span>Ends {formatDate(challenge.endDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Brief Info */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">{challenge.emoji || '🎯'}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Challenge Details</h2>
                <p className="text-sm text-gray-600">Track your progress and compete!</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-blue-100">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {challenge.habitName}
                </div>
                <div className="text-sm text-gray-600">Associated Habit</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-blue-100">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {participantCount}
                </div>
                <div className="text-sm text-gray-600">Participants</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-blue-100">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {leaderboard.reduce((sum, e) => sum + e.hiraPoints, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Hira Earned</div>
              </div>
            </div>
          </div>

          {/* Your Position Highlight */}
          {currentUserEntry && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Your Position</p>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl font-bold">
                      #{currentUserEntry.rank}
                    </div>
                    <div>
                      <div className="text-xl font-semibold">{currentUserEntry.userName}</div>
                      <div className="text-blue-100 text-sm">
                        {currentUserEntry.hiraPoints} Hira • {currentUserEntry.completions} completions
                      </div>
                    </div>
                  </div>
                </div>
                {getMedalEmoji(currentUserEntry.rank) && (
                  <div className="text-6xl">{getMedalEmoji(currentUserEntry.rank)}</div>
                )}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <TrophyIcon className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
              </div>
            </div>

            <div className="p-6">
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <TrophyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No participants yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = entry.userId === currentUser?.id;
                    const medal = getMedalEmoji(entry.rank);

                    return (
                      <div
                        key={entry.userId}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                          isCurrentUser
                            ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {/* Rank */}
                        <div className="flex-shrink-0 w-12 text-center">
                          {medal ? (
                            <div className="text-3xl">{medal}</div>
                          ) : (
                            <div
                              className={`w-10 h-10 ${getRankBadgeColor(entry.rank)} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                            >
                              {entry.rank}
                            </div>
                          )}
                        </div>

                        {/* User Avatar */}
                        <div className="flex-shrink-0">
                          {entry.userPhoto ? (
                            <img
                              src={entry.userPhoto}
                              alt={entry.userName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                              {entry.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold truncate ${
                              isCurrentUser ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {entry.userName}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <span className="text-lg">💎</span>
                              <span className="font-medium">{entry.hiraPoints} Hira</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-base">✅</span>
                              <span>{entry.completions} completions</span>
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex-shrink-0 w-24 hidden md:block">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                entry.rank === 1
                                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                  : entry.rank === 2
                                  ? 'bg-gradient-to-r from-gray-300 to-gray-500'
                                  : entry.rank === 3
                                  ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                                  : 'bg-gradient-to-r from-blue-400 to-purple-500'
                              }`}
                              style={{
                                width: `${Math.min(
                                  (entry.hiraPoints / Math.max(...leaderboard.map(e => e.hiraPoints), 1)) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Share Button */}
          <div className="mt-6">
            <button
              onClick={() => {
                const shareText = `Join me in the "${challenge.name}" challenge! 🎯\n\nI'm currently ranked #${currentUserEntry?.rank || 'N/A'}\n\n#HiraApp #Challenge`;
                if (navigator.share) {
                  navigator.share({ text: shareText });
                } else {
                  navigator.clipboard.writeText(shareText);
                  alert('Challenge link copied to clipboard!');
                }
              }}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <ShareIcon className="w-5 h-5" />
              Share Challenge
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

