import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { GiftIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { Reward } from '@/types';
import { getRewards, saveRewards, getUser, saveUser } from '@/utils/storage';
import { sounds } from '@/utils/sounds';

export default function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    setRewards(getRewards());
  }, []);

  const handleUnlockReward = (reward: Reward) => {
    if (!user) return;
    
    if (user.totalHira >= reward.hiraCost && !reward.unlocked) {
      const updatedRewards = rewards.map(r =>
        r.id === reward.id
          ? { ...r, unlocked: true, unlockedAt: new Date().toISOString() }
          : r
      );
      
      const updatedUser = {
        ...user,
        totalHira: user.totalHira - reward.hiraCost,
      };
      
      saveRewards(updatedRewards);
      saveUser(updatedUser);
      setRewards(updatedRewards);
      setUser(updatedUser);
      sounds.success();
    }
  };

  const canAfford = (cost: number) => {
    return user ? user.totalHira >= cost : false;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fitness': return '💪';
      case 'reading': return '📚';
      case 'music': return '🎵';
      case 'learning': return '🧠';
      default: return '🎁';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl text-black" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>Earn Rewards</h1>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 full">
                <span className="text-lg">💎</span>
                <span className="font-bold text-sm text-blue-600">{user?.totalHira || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Quick Rewards Section */}
          {rewards.filter(r => !r.unlocked && canAfford(r.hiraCost)).length > 0 && (
            <div className="mb-6 bg-blue-50 2xl p-5 border border-blue-200 relative">
              <button className="absolute top-3 right-3 p-1 hover:bg-blue-100 full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex gap-3 mb-4">
                {rewards
                  .filter(r => !r.unlocked && canAfford(r.hiraCost))
                  .slice(0, 3)
                  .map((reward) => (
                    <div key={reward.id} className="w-16 h-16 xl bg-white border-2 border-blue-200 flex items-center justify-center text-3xl shadow-sm">
                      {getCategoryIcon(reward.category)}
                    </div>
                  ))}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Get rewarded <span className="underline text-blue-600">fast</span>
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Choose and unlock fast with these simple rewards.
              </p>
              <button className="w-full py-3 bg-blue-500 text-white xl font-semibold hover:bg-blue-600 transition-colors">
                Show {rewards.filter(r => !r.unlocked && canAfford(r.hiraCost)).length} easy rewards
              </button>
            </div>
          )}

          {/* Most Popular Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🔔</span>
              <h2 className="text-lg font-bold text-gray-900">Most Popular</h2>
            </div>
            
            {rewards.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 full bg-gray-100 mb-4">
                  <GiftIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No rewards yet</h3>
                <p className="text-gray-600 text-sm">Check back soon for new rewards!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="bg-white 2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon with Rating */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-3xl border-2 border-gray-100">
                          {getCategoryIcon(reward.category)}
                        </div>
                        {!reward.unlocked && (
                          <div className="absolute -bottom-1 -left-1 bg-yellow-400 full px-1.5 py-0.5 flex items-center gap-0.5">
                            <span className="text-xs">⭐</span>
                            <span className="text-xs font-bold text-gray-900">4.5</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1">{reward.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{reward.description}</p>
                        
                        {reward.unlocked && reward.discountCode ? (
                          <div className="bg-green-50 border border-green-200 xl p-3">
                            <p className="text-xs text-green-600 font-semibold mb-1">Discount Code</p>
                            <p className="text-lg font-mono font-bold text-green-700">{reward.discountCode}</p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {canAfford(reward.hiraCost) && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 lg text-xs font-bold flex items-center gap-1">
                                  <span>⚡</span>
                                  5x rewards
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleUnlockReward(reward)}
                              disabled={!canAfford(reward.hiraCost) || reward.unlocked}
                              className={`px-5 py-2.5 full font-bold text-sm transition-all ${
                                reward.unlocked
                                  ? 'bg-green-500 text-white'
                                  : canAfford(reward.hiraCost)
                                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              {reward.unlocked ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircleIcon className="w-4 h-4" />
                                  Unlocked
                                </span>
                              ) : (
                                `Earn ${reward.hiraCost} 💎`
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

