import { useState } from 'react';
import { speak } from '../core/speech';
import type { Theme } from '../core/types';
import { HelperAvatar } from './Art';

interface WelcomeTourProps {
  theme: Theme;
  childName: string;
  onFinish: () => void;
}

export function WelcomeTourModal({ theme, childName, onFinish }: WelcomeTourProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: `Welcome to Rowan's Learning World! 🌊✨`,
      icon: '🗺️',
      subtitle: `A magical adaptive universe made just for ${childName}!`,
      text: `Every activity here grows and adapts with your child—from phonics and reading comprehension to mental math, number bonds, and brain-teasing puzzles.`,
      say: `Welcome to Rowan's Learning World! I am your helper, and I am so excited to explore with you!`,
    },
    {
      title: '5 Themed Islands to Explore 🏝️',
      icon: '🏝️',
      subtitle: 'Reading, Math, Mystery Manor, Puzzle Cove, and Game Deck',
      text: `• Phonics Cove: Sound out words, letters, sight words, and rhyming.\n• Number Reef: Counting, making 10 on the bridge, adding and subtracting.\n• Mystery Manor: Read detective clues and solve the case!\n• Puzzle Cove: Code Breaker, Memory Match, Tower of Hanoi, and Echo.\n• Game Deck: Tic-Tac-Toe and 2-Player Wonder Trivia!`,
      say: `You can tap any island on the map to choose what you want to learn!`,
    },
    {
      title: 'Voice Commands & Smart Support 🎙️💡',
      icon: '🎤',
      subtitle: 'Speak your answers or use your remote!',
      text: `• Tap "🎤 Say it" to speak your answer aloud or say "Help", "Say again", or "Go back"!\n• When a question feels tricky, tap "Help" to see the animated Mental Math Strategy Coach.\n• No penalties, no frustration—our helpers always encourage you to keep exploring!`,
      say: `You can speak your answers aloud anytime by tapping the microphone button!`,
    },
    {
      title: 'Family Multi-Player & Grown-ups Mode 👥🔒',
      icon: '🎯',
      subtitle: 'Take turns playing together across different ages!',
      text: `• Play Wonder Trivia with 2 players taking turns, each at their own calibrated age!\n• Parents can adjust screen time, hint modes, question timers, and learning rungs at any time under the 🔒 Grown-ups button.`,
      say: `Parents can customize learning levels anytime, or kids can take turns playing together!`,
    },
  ];

  const current = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      void speak(steps[step + 1].say);
    } else {
      onFinish();
    }
  };

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="card welcome-tour-card pop">
        <div className="tour-helper-banner">
          <HelperAvatar theme={theme} size={74} talking />
          <div className="tour-badge">{theme.helper.name} · {theme.helper.role}</div>
        </div>

        <div className="tour-content">
          <span className="big-emoji">{current.icon}</span>
          <h2>{current.title}</h2>
          <h4 className="tour-subtitle">{current.subtitle}</h4>
          <div className="tour-body-text">
            {current.text.split('\n').map((line, i) => (
              <p key={i} className="mb-4">{line}</p>
            ))}
          </div>
        </div>

        <div className="tour-pagination">
          {steps.map((_, i) => (
            <span key={i} className={`tour-dot${i === step ? ' active' : ''}`} />
          ))}
        </div>

        <div className="row justify-center mt-12 gap-8">
          <button className="btn primary big" data-autofocus onClick={handleNext}>
            {step === steps.length - 1 ? "Let's Explore! 🚀" : 'Next Step ➡️'}
          </button>
          <button className="btn" onClick={onFinish}>
            Skip Guide
          </button>
        </div>
      </div>
    </div>
  );
}
