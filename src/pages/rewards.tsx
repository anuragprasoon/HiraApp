import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { GiftIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { Reward } from '@/types';
import { getRewards, saveRewards, getUser, saveUser, getHabits } from '@/utils/storage';
import { sounds } from '@/utils/sounds';

export default function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    setRewards(getRewards());
  }, []);

  // Get relevant rewards based on user profile
  const getRelevantRewards = (): Reward[] => {
    if (!user) return [];
    
    const allRewards = getRewards();
    const relevantRewards: Reward[] = [];
    
    // Match rewards based on user's hobbies
    if (user.hobbies && user.hobbies.length > 0) {
      user.hobbies.forEach(hobby => {
        const hobbyLower = hobby.toLowerCase();
        allRewards.forEach(reward => {
          const rewardTitleLower = reward.title.toLowerCase();
          const rewardDescLower = reward.description.toLowerCase();
          const rewardCategoryLower = reward.category.toLowerCase();
          
          // Check if reward matches hobby
          if (
            (rewardTitleLower.includes(hobbyLower) ||
             rewardDescLower.includes(hobbyLower) ||
             rewardCategoryLower.includes(hobbyLower)) &&
            !relevantRewards.find(r => r.id === reward.id)
          ) {
            relevantRewards.push(reward);
          }
        });
      });
    }
    
    // Match rewards based on profession/college
    if (user.collegeOrProfession) {
      const profLower = user.collegeOrProfession.toLowerCase();
      allRewards.forEach(reward => {
        const rewardTitleLower = reward.title.toLowerCase();
        const rewardDescLower = reward.description.toLowerCase();
        const rewardCategoryLower = reward.category.toLowerCase();
        
        // Check if reward matches profession
        if (
          (rewardTitleLower.includes(profLower) ||
           rewardDescLower.includes(profLower) ||
           rewardCategoryLower.includes(profLower)) &&
          !relevantRewards.find(r => r.id === reward.id)
        ) {
          relevantRewards.push(reward);
        }
      });
    }
    
    // Match rewards based on age group
    if (user.age) {
      if (user.age < 18) {
        // Students - learning, books, education
        allRewards.forEach(reward => {
          if (
            (reward.category.toLowerCase().includes('learning') ||
             reward.category.toLowerCase().includes('reading') ||
             reward.title.toLowerCase().includes('book') ||
             reward.title.toLowerCase().includes('course')) &&
            !relevantRewards.find(r => r.id === reward.id)
          ) {
            relevantRewards.push(reward);
          }
        });
      } else if (user.age >= 18 && user.age < 25) {
        // Young adults - fitness, tech, entertainment
        allRewards.forEach(reward => {
          if (
            (reward.category.toLowerCase().includes('fitness') ||
             reward.category.toLowerCase().includes('music') ||
             reward.title.toLowerCase().includes('gym') ||
             reward.title.toLowerCase().includes('subscription')) &&
            !relevantRewards.find(r => r.id === reward.id)
          ) {
            relevantRewards.push(reward);
          }
        });
      } else {
        // Adults - wellness, professional development
        allRewards.forEach(reward => {
          if (
            (reward.category.toLowerCase().includes('wellness') ||
             reward.title.toLowerCase().includes('course') ||
             reward.title.toLowerCase().includes('premium')) &&
            !relevantRewards.find(r => r.id === reward.id)
          ) {
            relevantRewards.push(reward);
          }
        });
      }
    }
    
    // If no relevant rewards found, return affordable rewards
    if (relevantRewards.length === 0) {
      return allRewards.filter(r => !r.unlocked && canAfford(r.hiraCost)).slice(0, 5);
    }
    
    return relevantRewards;
  };

  // Check if user has completed any habit goal
  const hasCompletedHabitGoal = (): boolean => {
    const habits = getHabits();
    return habits.some(habit => {
      if (!habit.totalDays || !habit.startDate) return false;
      
      const startDate = new Date(habit.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + habit.totalDays);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      // Check if habit goal period has ended
      if (today >= endDate) {
        // Check if habit was completed for all days in the goal period
        const daysInGoal = habit.totalDays;
        const uniqueCompletedDates = new Set(habit.completedDates);
        return uniqueCompletedDates.size >= daysInGoal;
      }
      
      return false;
    });
  };

  const handleUnlockReward = (reward: Reward) => {
    if (!user) return;
    
    // Check if it's a cash reward and if user has completed a habit goal
    if (isCashReward(reward.category) && !hasCompletedHabitGoal()) {
      alert('Cash redemption is only allowed after completing an entire habit goal. Complete a habit goal first!');
      return;
    }
    
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
      case 'wellness': return '🧘';
      case 'cash': return '💰';
      case 'store': return '🛍️';
      default: return '🎁';
    }
  };

  const isCashReward = (category: string): boolean => {
    return category.toLowerCase() === 'cash';
  };

  // Get cash rewards separately
  const getCashRewards = (): Reward[] => {
    return rewards.filter(r => isCashReward(r.category));
  };

  // Get non-cash rewards
  const getNonCashRewards = (): Reward[] => {
    return rewards.filter(r => !isCashReward(r.category));
  };

  // Get store products (products that can be bought/sold)
  const getStoreProducts = (): Reward[] => {
    const storeProducts: Reward[] = [
      {
        id: 'product_fitness_band',
        title: 'Fitness Band',
        description: 'Track your workouts and daily activity',
        hiraCost: 50,
        category: 'store',
        unlocked: false,
      },
      {
        id: 'product_water_bottle',
        title: 'Premium Water Bottle',
        description: 'Stay hydrated with this stylish bottle',
        hiraCost: 20,
        category: 'store',
        unlocked: false,
      },
      {
        id: 'product_yoga_mat',
        title: 'Yoga Mat',
        description: 'Perfect for meditation and yoga sessions',
        hiraCost: 35,
        category: 'store',
        unlocked: false,
      },
      {
        id: 'product_books_set',
        title: 'Book Collection Set',
        description: 'Set of 3 motivational books',
        hiraCost: 45,
        category: 'store',
        unlocked: false,
      },
      {
        id: 'product_skincare_kit',
        title: 'Skincare Kit',
        description: 'Complete skincare routine products',
        hiraCost: 60,
        category: 'store',
        unlocked: false,
      },
      {
        id: 'product_headphones',
        title: 'Wireless Headphones',
        description: 'Premium quality for music and meditation',
        hiraCost: 80,
        category: 'store',
        unlocked: false,
      },
    ];

    // Filter based on user profile for relevance
    if (user) {
      const relevantProducts: Reward[] = [];
      
      // Match products based on hobbies
      if (user.hobbies && user.hobbies.length > 0) {
        user.hobbies.forEach(hobby => {
          const hobbyLower = hobby.toLowerCase();
          storeProducts.forEach(product => {
            if (
              (product.title.toLowerCase().includes(hobbyLower) ||
               product.description.toLowerCase().includes(hobbyLower)) &&
              !relevantProducts.find(p => p.id === product.id)
            ) {
              relevantProducts.push(product);
            }
          });
        });
      }

      // Match products based on profession
      if (user.collegeOrProfession) {
        const profLower = user.collegeOrProfession.toLowerCase();
        if (profLower.includes('fitness') || profLower.includes('health') || profLower.includes('gym')) {
          storeProducts.forEach(product => {
            if (
              (product.title.toLowerCase().includes('fitness') ||
               product.title.toLowerCase().includes('yoga') ||
               product.title.toLowerCase().includes('water')) &&
              !relevantProducts.find(p => p.id === product.id)
            ) {
              relevantProducts.push(product);
            }
          });
        }
        if (profLower.includes('student') || profLower.includes('college') || profLower.includes('read')) {
          storeProducts.forEach(product => {
            if (
              product.title.toLowerCase().includes('book') &&
              !relevantProducts.find(p => p.id === product.id)
            ) {
              relevantProducts.push(product);
            }
          });
        }
      }

      // If no relevant products, return all products
      return relevantProducts.length > 0 ? relevantProducts : storeProducts;
    }

    return storeProducts;
  };

  // Calculate rupee amount from Hira (1 Hira = 1.5 rupees)
  const getRupeeAmount = (hiraCost: number): number => {
    return hiraCost * 1.5;
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
          {/* Relevant Rewards Section */}
          {getRelevantRewards().filter(r => !isCashReward(r.category)).length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 border border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✨</span>
                <h2 className="text-lg font-bold text-gray-900">Relevant for You</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Based on your interests and profile, we think you'll love these rewards!
              </p>
              <div className="space-y-3">
                {getRelevantRewards().filter(r => !isCashReward(r.category)).slice(0, 3).map((reward) => (
                  <div
                    key={reward.id}
                    className="bg-white p-4 border border-purple-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-2xl border-2 border-purple-200">
                        {getCategoryIcon(reward.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1">{reward.title}</h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-1">{reward.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{reward.category}</span>
                          <button
                            onClick={() => handleUnlockReward(reward)}
                            disabled={!canAfford(reward.hiraCost) || reward.unlocked}
                            className={`px-4 py-1.5 text-xs font-bold transition-all ${
                              reward.unlocked
                                ? 'bg-green-500 text-white'
                                : canAfford(reward.hiraCost)
                                ? 'bg-purple-500 text-white hover:bg-purple-600'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {reward.unlocked ? 'Unlocked' : `${reward.hiraCost} 💎`}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cash Redeems Section */}
          {getCashRewards().length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💰</span>
                <h2 className="text-lg font-bold text-gray-900">Cash Redeems</h2>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Redeem your Hira for cash! (1 Hira = ₹1.5)
              </p>
              <p className="text-xs text-green-600 font-medium mb-4">
                ⚠️ Cash redeem only allowed after completing an entire habit goal
              </p>
              <div className="space-y-3">
                {getCashRewards().map((reward) => (
                  <div
                    key={reward.id}
                    className="bg-white p-4 border border-green-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-2xl border-2 border-green-200">
                        {getCategoryIcon(reward.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1">
                          Cash Redeem ₹{getRupeeAmount(reward.hiraCost).toFixed(0)}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                          {reward.hiraCost} Hira = ₹{getRupeeAmount(reward.hiraCost).toFixed(0)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{reward.category}</span>
                          <button
                            onClick={() => handleUnlockReward(reward)}
                            disabled={!canAfford(reward.hiraCost) || reward.unlocked || !hasCompletedHabitGoal()}
                            className={`px-4 py-1.5 text-xs font-bold transition-all ${
                              reward.unlocked
                                ? 'bg-green-500 text-white'
                                : canAfford(reward.hiraCost) && hasCompletedHabitGoal()
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {reward.unlocked ? 'Unlocked' : `${reward.hiraCost} 💎`}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Store and Sell Products Section */}
          {getStoreProducts().length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 p-6 border border-orange-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🛍️</span>
                <h2 className="text-lg font-bold text-gray-900">Store & Sell Products</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Buy and sell relevant products using your Hira points. Products are suggested based on your interests!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getStoreProducts().slice(0, 6).map((product) => (
                  <div
                    key={product.id}
                    className="bg-white p-4 border border-orange-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-2xl border-2 border-orange-200 flex-shrink-0">
                        {getCategoryIcon(product.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1 text-sm">{product.title}</h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-orange-600">{product.hiraCost} 💎</span>
                          <button
                            onClick={() => handleUnlockReward(product)}
                            disabled={!canAfford(product.hiraCost) || product.unlocked}
                            className={`px-3 py-1.5 text-xs font-bold transition-all flex-shrink-0 ${
                              product.unlocked
                                ? 'bg-green-500 text-white'
                                : canAfford(product.hiraCost)
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {product.unlocked ? 'Bought' : 'Buy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Rewards Section */}
          {getNonCashRewards().filter(r => !r.unlocked && canAfford(r.hiraCost)).length > 0 && (
            <div className="mb-6 bg-blue-50 2xl p-5 border border-blue-200 relative">
              <button className="absolute top-3 right-3 p-1 hover:bg-blue-100 full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex gap-3 mb-4">
                {getNonCashRewards()
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
                Show {getNonCashRewards().filter(r => !r.unlocked && canAfford(r.hiraCost)).length} easy rewards
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
                {getNonCashRewards().map((reward) => (
                  <div
                    key={reward.id}
                    className={`bg-white 2xl p-4 border shadow-sm hover:shadow-md transition-all ${
                      isCashReward(reward.category) ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon with Rating */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-16 h-16 xl flex items-center justify-center text-3xl border-2 ${
                          isCashReward(reward.category)
                            ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-200'
                            : 'bg-gradient-to-br from-blue-100 to-purple-100 border-gray-100'
                        }`}>
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
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{reward.description}</p>
                        {isCashReward(reward.category) && (
                          <p className="text-xs text-green-600 font-medium mb-2">
                            ⚠️ Cash redeem only allowed after completing an entire habit goal
                          </p>
                        )}
                        
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
                              disabled={!canAfford(reward.hiraCost) || reward.unlocked || (isCashReward(reward.category) && !hasCompletedHabitGoal())}
                              className={`px-5 py-2.5 full font-bold text-sm transition-all ${
                                reward.unlocked
                                  ? 'bg-green-500 text-white'
                                  : canAfford(reward.hiraCost) && !(isCashReward(reward.category) && !hasCompletedHabitGoal())
                                  ? isCashReward(reward.category)
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              {reward.unlocked ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircleIcon className="w-4 h-4" />
                                  Unlocked
                                </span>
                              ) : (
                                `Buy with ${reward.hiraCost} 💎`
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

