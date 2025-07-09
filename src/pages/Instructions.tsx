import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../components/themes/ThemeProvider';
import { useAppState } from '../store/AppStateProvider';
import LiquidGlassCard from '../components/ui/LiquidGlassCard';

interface InstructionSection {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
}

const InstructionsPage: React.FC = () => {
  const { currentTheme } = useTheme();
  const { trackEvent } = useAppState();
  const [activeSection, setActiveSection] = useState('introduction');

  const sections: InstructionSection[] = [
    {
      id: 'introduction',
      title: 'Introduction to I Ching',
      icon: '📚',
      content: <IntroductionSection />,
    },
    {
      id: 'how-to-use',
      title: 'How to Use This App',
      icon: '🎯',
      content: <HowToUseSection />,
    },
    {
      id: 'interpreting',
      title: 'Interpreting Results',
      icon: '🔮',
      content: <InterpretingSection />,
    },
    {
      id: 'hexagrams',
      title: 'Understanding Hexagrams',
      icon: '⚊',
      content: <HexagramsSection />,
    },
    {
      id: 'tips',
      title: 'Tips for Better Readings',
      icon: '💡',
      content: <TipsSection />,
    },
    {
      id: 'history',
      title: 'Historical Context',
      icon: '🏛️',
      content: <HistorySection />,
    },
  ];

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    trackEvent('instructions_section_viewed', { section: sectionId });
  };

  const activeContent = sections.find(s => s.id === activeSection)?.content;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <LiquidGlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 
                  className="text-3xl font-bold gradient-text mb-2"
                  style={{ fontFamily: currentTheme.typography.secondary }}
                >
                  I Ching Guide
                </h1>
                <p className="opacity-80">
                  Learn the ancient art of divination and wisdom
                </p>
              </div>
              
              <Link to="/divination" className="btn-premium">
                ✨ Try Reading
              </Link>
            </div>
          </LiquidGlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <LiquidGlassCard className="p-4 sticky top-24">
              <h3 className="font-semibold mb-4">Contents</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      activeSection === section.id 
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50' 
                        : 'hover:bg-white/10'
                    }`}
                    style={{
                      border: activeSection === section.id 
                        ? `1px solid ${currentTheme.colors.primary}` 
                        : '1px solid transparent'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{section.icon}</span>
                      <span className="font-medium text-sm">{section.title}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </LiquidGlassCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeContent}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// Introduction Section
const IntroductionSection: React.FC = () => (
  <LiquidGlassCard className="p-8">
    <h2 className="text-2xl font-semibold mb-6">What is the I Ching?</h2>
    
    <div className="space-y-6">
      <div className="prose prose-invert max-w-none">
        <p className="text-lg leading-relaxed">
          The I Ching, also known as the Book of Changes, is an ancient Chinese divination system 
          that has been used for over 3,000 years to gain insights into life's questions and challenges.
        </p>
        
        <p>
          At its core, the I Ching is based on the concept of change as the fundamental nature of 
          existence. It uses 64 hexagrams (six-line figures) to represent different situations, 
          energies, and transformations in life.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-lg border border-white/10">
          <h3 className="font-semibold mb-3 text-blue-300">⚊ Yin and Yang</h3>
          <p className="text-sm opacity-80">
            The foundation of I Ching lies in the interplay between Yin (⚋) and Yang (⚊) - 
            the complementary forces that govern all existence.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 p-6 rounded-lg border border-white/10">
          <h3 className="font-semibold mb-3 text-green-300">🔄 Change</h3>
          <p className="text-sm opacity-80">
            The I Ching teaches that change is constant, and by understanding these patterns, 
            we can navigate life's transitions with wisdom.
          </p>
        </div>
      </div>

      <div className="bg-yellow-500/10 p-6 rounded-lg border border-yellow-500/20">
        <h3 className="font-semibold mb-3 text-yellow-300">🌟 Purpose</h3>
        <p className="text-sm opacity-80">
          The I Ching is not about predicting the future, but about understanding the present 
          moment and the energies at play, helping you make informed decisions and gain deeper 
          self-awareness.
        </p>
      </div>
    </div>
  </LiquidGlassCard>
);

// How to Use Section
const HowToUseSection: React.FC = () => (
  <LiquidGlassCard className="p-8">
    <h2 className="text-2xl font-semibold mb-6">How to Use This App</h2>
    
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
            1
          </div>
          <div>
            <h3 className="font-semibold mb-2">Formulate Your Question</h3>
            <p className="text-sm opacity-80">
              Start by clearly defining what you want guidance on. Focus on "how" or "what" 
              questions rather than yes/no questions. For example: "How should I approach 
              this career decision?" instead of "Should I change jobs?"
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
            2
          </div>
          <div>
            <h3 className="font-semibold mb-2">Coin Toss Process</h3>
            <p className="text-sm opacity-80">
              The app will guide you through six coin tosses to generate your hexagram. 
              Each toss creates one line of the hexagram, building from bottom to top. 
              Focus on your question during this process.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
            3
          </div>
          <div>
            <h3 className="font-semibold mb-2">Receive Your Interpretation</h3>
            <p className="text-sm opacity-80">
              Our AI will analyze your hexagram and provide a detailed interpretation 
              tailored to your question. This includes the hexagram's meaning, relevant 
              changing lines, and practical guidance.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
            4
          </div>
          <div>
            <h3 className="font-semibold mb-2">Reflect and Apply</h3>
            <p className="text-sm opacity-80">
              Take time to reflect on the interpretation. The I Ching's wisdom often 
              reveals itself gradually. Save important readings to your history and 
              revisit them as situations evolve.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/20">
        <h3 className="font-semibold mb-3 text-blue-300">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm opacity-80">
          <li>• Ask one question per reading for clearer guidance</li>
          <li>• Approach with an open mind and sincere intention</li>
          <li>• Don't ask the same question repeatedly in short periods</li>
          <li>• Use the reading as a starting point for self-reflection</li>
        </ul>
      </div>
    </div>
  </LiquidGlassCard>
);

// Interpreting Section
const InterpretingSection: React.FC = () => (
  <LiquidGlassCard className="p-8">
    <h2 className="text-2xl font-semibold mb-6">Understanding Your Results</h2>
    
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Hexagram Structure</h3>
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="text-center">
                <div className="space-y-1">
                  <div className="flex justify-center"><div className="w-16 h-1 bg-blue-400"></div></div>
                  <div className="flex justify-center gap-1">
                    <div className="w-6 h-1 bg-blue-400"></div>
                    <div className="w-6 h-1 bg-blue-400"></div>
                  </div>
                  <div className="flex justify-center"><div className="w-16 h-1 bg-blue-400"></div></div>
                  <div className="flex justify-center gap-1">
                    <div className="w-6 h-1 bg-blue-400"></div>
                    <div className="w-6 h-1 bg-blue-400"></div>
                  </div>
                  <div className="flex justify-center"><div className="w-16 h-1 bg-blue-400"></div></div>
                  <div className="flex justify-center gap-1">
                    <div className="w-6 h-1 bg-blue-400"></div>
                    <div className="w-6 h-1 bg-blue-400"></div>
                  </div>
                </div>
                <p className="text-xs mt-2 opacity-70">Example Hexagram</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Line Types</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-1 bg-blue-400"></div>
              <span className="text-sm">Yang Line (⚊) - Active, firm, masculine</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex gap-1">
                <div className="w-6 h-1 bg-blue-400"></div>
                <div className="w-6 h-1 bg-blue-400"></div>
              </div>
              <span className="text-sm">Yin Line (⚋) - Receptive, yielding, feminine</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Key Elements to Consider</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 rounded-lg border border-white/10">
            <h4 className="font-semibold mb-2 text-purple-300">Primary Hexagram</h4>
            <p className="text-sm opacity-80">
              Represents the current situation or the nature of your question. 
              This is the foundation of your reading.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 p-4 rounded-lg border border-white/10">
            <h4 className="font-semibold mb-2 text-green-300">Changing Lines</h4>
            <p className="text-sm opacity-80">
              Lines that are transitioning from one state to another. These represent 
              areas of change and transformation in your situation.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-4 rounded-lg border border-white/10">
            <h4 className="font-semibold mb-2 text-orange-300">Secondary Hexagram</h4>
            <p className="text-sm opacity-80">
              Formed after changing lines transform. Shows the potential outcome 
              or direction of development.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-4 rounded-lg border border-white/10">
            <h4 className="font-semibold mb-2 text-blue-300">Trigrams</h4>
            <p className="text-sm opacity-80">
              Each hexagram consists of two trigrams (three-line figures) that 
              represent different natural forces and qualities.
            </p>
          </div>
        </div>
      </div>
    </div>
  </LiquidGlassCard>
);

// Hexagrams Section
const HexagramsSection: React.FC = () => (
  <LiquidGlassCard className="p-8">
    <h2 className="text-2xl font-semibold mb-6">The 64 Hexagrams</h2>
    
    <div className="space-y-6">
      <div className="prose prose-invert max-w-none">
        <p>
          The I Ching consists of 64 hexagrams, each representing a unique situation, 
          energy pattern, or life principle. Each hexagram is composed of six lines, 
          arranged in two trigrams (three-line sets).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">The Eight Trigrams</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="space-y-1">
                <div className="w-8 h-0.5 bg-blue-400"></div>
                <div className="w-8 h-0.5 bg-blue-400"></div>
                <div className="w-8 h-0.5 bg-blue-400"></div>
              </div>
              <div>
                <div className="font-medium">☰ Heaven (Qian)</div>
                <div className="text-sm opacity-70">Creative, strong, leadership</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="space-y-1">
                <div className="flex gap-1">
                  <div className="w-3 h-0.5 bg-blue-400"></div>
                  <div className="w-3 h-0.5 bg-blue-400"></div>
                </div>
                <div className="flex gap-1">
                  <div className="w-3 h-0.5 bg-blue-400"></div>
                  <div className="w-3 h-0.5 bg-blue-400"></div>
                </div>
                <div className="flex gap-1">
                  <div className="w-3 h-0.5 bg-blue-400"></div>
                  <div className="w-3 h-0.5 bg-blue-400"></div>
                </div>
              </div>
              <div>
                <div className="font-medium">☷ Earth (Kun)</div>
                <div className="text-sm opacity-70">Receptive, nurturing, yielding</div>
              </div>
            </div>
            
            <div className="text-sm opacity-70">
              <p>+ 6 more trigrams representing water, fire, thunder, wind, mountain, and lake</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Famous Hexagrams</h3>
          <div className="space-y-3">
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="font-medium">#1 - The Creative (乾)</div>
              <div className="text-sm opacity-70">Pure yang energy, initiation, leadership</div>
            </div>
            
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="font-medium">#2 - The Receptive (坤)</div>
              <div className="text-sm opacity-70">Pure yin energy, support, devotion</div>
            </div>
            
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="font-medium">#63 - After Completion (既济)</div>
              <div className="text-sm opacity-70">Achievement, but need for vigilance</div>
            </div>
            
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="font-medium">#64 - Before Completion (未济)</div>
              <div className="text-sm opacity-70">Potential, transition, careful planning</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LiquidGlassCard>
);

// Tips Section
const TipsSection: React.FC = () => (
  <LiquidGlassCard className="p-8">
    <h2 className="text-2xl font-semibold mb-6">Tips for Better Readings</h2>
    
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-green-300">✅ Do</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Approach with respect and sincere intention</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Ask specific, thoughtful questions</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Focus on your personal growth and choices</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Keep a journal of your readings</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Reflect on the wisdom over time</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Be open to unexpected insights</span>
            </li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-red-300">❌ Don't</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Ask the same question repeatedly</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Expect literal predictions of the future</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Make major decisions based solely on one reading</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Ask about other people's private matters</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Approach with skepticism or frivolity</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Ignore your own intuition and wisdom</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-lg border border-blue-500/20">
        <h3 className="font-semibold mb-3 text-blue-300">🌟 Advanced Practice</h3>
        <p className="text-sm opacity-80 mb-4">
          As you become more familiar with the I Ching, you can deepen your practice:
        </p>
        <ul className="space-y-2 text-sm opacity-80">
          <li>• Study the original Chinese text and commentaries</li>
          <li>• Learn about the historical and philosophical context</li>
          <li>• Practice meditation before readings</li>
          <li>• Connect with I Ching communities and teachers</li>
          <li>• Use the I Ching for daily reflection and guidance</li>
        </ul>
      </div>
    </div>
  </LiquidGlassCard>
);

// History Section
const HistorySection: React.FC = () => (
  <LiquidGlassCard className="p-8">
    <h2 className="text-2xl font-semibold mb-6">Historical Context</h2>
    
    <div className="space-y-6">
      <div className="prose prose-invert max-w-none">
        <p>
          The I Ching has a rich history spanning over three millennia, making it one of 
          the oldest Chinese classical texts still in use today.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Historical Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-20 text-sm font-medium text-blue-300">1000 BCE</div>
            <div>
              <div className="font-medium">Zhou Dynasty Origins</div>
              <div className="text-sm opacity-80">
                The hexagram system was developed, attributed to King Wen of Zhou
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-20 text-sm font-medium text-blue-300">500 BCE</div>
            <div>
              <div className="font-medium">Confucian Commentary</div>
              <div className="text-sm opacity-80">
                Confucius and his followers added the Ten Wings (commentaries)
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-20 text-sm font-medium text-blue-300">200 BCE</div>
            <div>
              <div className="font-medium">Han Dynasty Codification</div>
              <div className="text-sm opacity-80">
                The text was standardized and became part of the Chinese classics
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-20 text-sm font-medium text-blue-300">1900s</div>
            <div>
              <div className="font-medium">Western Discovery</div>
              <div className="text-sm opacity-80">
                Translated into Western languages, influencing psychology and philosophy
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 rounded-lg border border-amber-500/20">
          <h3 className="font-semibold mb-3 text-amber-300">🏛️ Cultural Impact</h3>
          <p className="text-sm opacity-80">
            The I Ching influenced Chinese philosophy, medicine, martial arts, and governance 
            for centuries. It's considered fundamental to understanding Chinese thought.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 rounded-lg border border-indigo-500/20">
          <h3 className="font-semibold mb-3 text-indigo-300">🌍 Modern Relevance</h3>
          <p className="text-sm opacity-80">
            Today, the I Ching is studied worldwide for its insights into change, decision-making, 
            and understanding life's complexities.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 p-6 rounded-lg border border-green-500/20">
        <h3 className="font-semibold mb-3 text-green-300">🌱 Living Wisdom</h3>
        <p className="text-sm opacity-80">
          The I Ching's enduring relevance lies in its profound understanding of change and 
          human nature. It offers timeless wisdom for navigating life's challenges and 
          opportunities, making it as relevant today as it was 3,000 years ago.
        </p>
      </div>
    </div>
  </LiquidGlassCard>
);

export default InstructionsPage;