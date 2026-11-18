// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { make10Question } from '../content/generators';
import { themeById } from '../core/themes';
import type { Profile } from '../core/types';
import NumberBridge from '../apps/NumberBridge';
import { BridgeVisual } from '../ui/Visuals';

afterEach(() => {
  cleanup();
});

const mockProfile: Profile = {
  id: 'p-rowan',
  name: 'Rowan',
  avatar: '🧑‍🚀',
  themeId: 'space-ranger',
  age: 6,
  readingStage: 'phonics',
  mathStage: 'add10',
  placementDone: true,
  levels: { reading: 2, math: 2 },
  focusSkills: [],
  stickers: [],
  stars: 12,
  createdAt: Date.now(),
  settings: {
    dailyMinutes: 0,
    hintMode: 'full',
    speechRate: 0.9,
    timerMode: 'off',
    disabledApps: [],
    allowedThemes: [],
  },
  createdOnDeviceId: 'dev-1',
};

describe('Number Bonds Adaptive Scaling', () => {
  it('generates bonds for target 10, 20, 50, and 100', () => {
    // Target 10
    const q10 = make10Question('math.make10', { target: 10 });
    expect(q10.target).toBe(10);
    expect(q10.a! + Number(q10.answer)).toBe(10);
    expect(q10.prompt).toContain('= 10');

    // Target 20
    const q20 = make10Question('math.make10', { target: 20 });
    expect(q20.target).toBe(20);
    expect(q20.a! + Number(q20.answer)).toBe(20);
    expect(q20.prompt).toContain('= 20');
    expect(Number(q20.answer)).toBeGreaterThanOrEqual(1);
    expect(Number(q20.answer)).toBeLessThanOrEqual(19);

    // Target 50
    const q50 = make10Question('math.make10', { target: 50 });
    expect(q50.target).toBe(50);
    expect(q50.a! + Number(q50.answer)).toBe(50);
    expect(q50.prompt).toContain('= 50');

    // Target 100
    const q100 = make10Question('math.make10', { target: 100 });
    expect(q100.target).toBe(100);
    expect(q100.a! + Number(q100.answer)).toBe(100);
    expect(q100.prompt).toContain('= 100');
  });

  it('renders 10 planks for target 10 and 20 planks for target 20 in BridgeVisual', () => {
    const { rerender } = render(<BridgeVisual a={6} gap={4} target={10} pick={null} />);
    expect(screen.getByText(/Bridge Goal: Make/)).toBeTruthy();
    expect(document.querySelectorAll('.plank').length).toBe(10);
    expect(screen.getByText(/6 planks are in place. How many more make 10\?/)).toBeTruthy();

    rerender(<BridgeVisual a={14} gap={6} target={20} pick={null} />);
    expect(screen.getByText(/Bridge Goal: Make/)).toBeTruthy();
    expect(document.querySelectorAll('.plank').length).toBe(20);
    expect(screen.getByText(/14 planks are in place. How many more make 20\?/)).toBeTruthy();
  });

  it('adapts NumberBridge cap to 20 when answering target 10 correctly', async () => {
    const spaceTheme = themeById('space-ranger');
    render(
      <NumberBridge
        profile={mockProfile}
        theme={spaceTheme}
        onExit={() => {}}
      />
    );

    // Initial state: target is 10
    expect(screen.getByText(/Bridge Goal: Make/)).toBeTruthy();
    expect(document.querySelectorAll('.plank').length).toBe(10);

    // Find the number of placed planks
    const a = document.querySelectorAll('.plank.on').length;
    expect(a).toBeGreaterThan(0);
    const correctAns = String(10 - a);

    const correctBtn = screen.getByRole('button', { name: correctAns });
    fireEvent.click(correctBtn);

    // Check level-up toast
    await waitFor(() => expect(screen.getByText(/Level Up! Bridge extended to 20!/)).toBeTruthy());
  });
});
