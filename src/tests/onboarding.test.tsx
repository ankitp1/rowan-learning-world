// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { themeById } from '../core/themes';
import { WelcomeTourModal } from '../ui/WelcomeTour';
import { ProfileForm } from '../screens/WhoPlaying';
import type { Profile } from '../core/types';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
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

describe('Modern Contextual Welcome Tour', () => {
  it('renders theme-contextual greeting, role, and explorer badge', () => {
    const spaceTheme = themeById('space-ranger');
    const onFinish = vi.fn();
    const onStartMission = vi.fn();

    render(
      <WelcomeTourModal
        theme={spaceTheme}
        childName="Rowan"
        profile={mockProfile}
        onFinish={onFinish}
        onStartMission={onStartMission}
      />
    );

    // Contextual badge & role
    expect(screen.getAllByText('Rowan').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Star Fleet Cadet').length).toBeGreaterThan(0);
    expect(screen.getByText(/1st Grade Explorer · Age 6/)).toBeTruthy();
    expect(screen.getByText(/Ranger Buzz/)).toBeTruthy();

    // Check step pills
    expect(screen.getByRole('button', { name: /Step 1: Explorer ID/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Step 2: Themed Realms/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Step 3: Superpowers/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Step 4: Launchpad/ })).toBeTruthy();
  });

  it('navigates through realms and superpowers to launchpad', () => {
    const spaceTheme = themeById('space-ranger');
    const onFinish = vi.fn();
    const onStartMission = vi.fn();

    render(
      <WelcomeTourModal
        theme={spaceTheme}
        childName="Rowan"
        profile={mockProfile}
        onFinish={onFinish}
        onStartMission={onStartMission}
      />
    );

    // Advance to Step 2 (Realms)
    fireEvent.click(screen.getByRole('button', { name: /Next Step/ }));
    expect(screen.getByText(/Your Themed Learning Realms/)).toBeTruthy();
    expect(screen.getByText(spaceTheme.islands.reading)).toBeTruthy();
    expect(screen.getByText(spaceTheme.islands.math)).toBeTruthy();
    expect(screen.getByText(new RegExp(spaceTheme.mystery.name))).toBeTruthy();

    // Tapping a realm
    const readingCard = screen.getByText(spaceTheme.islands.reading).closest('button');
    expect(readingCard).toBeTruthy();
    fireEvent.click(readingCard!);

    // Advance to Step 3 (Superpowers)
    fireEvent.click(screen.getByRole('button', { name: /Next Step/ }));
    expect(screen.getByText(/Two Superpowers for Rowan/)).toBeTruthy();
    expect(screen.getByText(/Superpower 1: Just Say It!/)).toBeTruthy();
    expect(screen.getByText(/Superpower 2: Strategy Coach/)).toBeTruthy();
    expect(screen.getByText(/Family Multi-Player/)).toBeTruthy();

    // Advance to Step 4 (Launchpad)
    fireEvent.click(screen.getByRole('button', { name: /Review Launchpad/ }));
    expect(screen.getByText(/You're Cleared for Departure/)).toBeTruthy();
    expect(screen.getByText(/Start Today's Daily Mission/)).toBeTruthy();
    expect(screen.getByText(/Explore the World Map/)).toBeTruthy();

    // Trigger Start Mission
    fireEvent.click(screen.getByRole('button', { name: /Start Today's Daily Mission/ }));
    expect(onStartMission).toHaveBeenCalledTimes(1);
  });

  it('allows skipping immediately via Jump In button', () => {
    const spaceTheme = themeById('space-ranger');
    const onFinish = vi.fn();

    render(
      <WelcomeTourModal
        theme={spaceTheme}
        childName="Sammy"
        profile={{ ...mockProfile, name: 'Sammy', age: 3 }}
        onFinish={onFinish}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Skip onboarding guide/ }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});

describe('Modern Profile Registration Form', () => {
  it('renders live passport preview, responds to avatar/theme/age selection, and creates profile', () => {
    const onCreated = vi.fn();
    render(<ProfileForm onCreated={onCreated} />);

    expect(screen.getByText(/New Explorer Registration/)).toBeTruthy();
    const nameInput = screen.getByPlaceholderText('Name');

    // Type name
    fireEvent.change(nameInput, { target: { value: 'Sammy' } });
    expect(screen.getByText('Sammy')).toBeTruthy();

    // Select Avatar
    const foxAvatar = screen.getByRole('button', { name: /avatar 🦊/ });
    fireEvent.click(foxAvatar);

    // Select Age 3
    const age3Btn = screen.getByRole('button', { name: '3 yrs' });
    fireEvent.click(age3Btn);
    expect(screen.getAllByText(/Preschool · Gentle sounds, colors & counting/).length).toBeGreaterThan(0);

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Let's go/ }));
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(typeof onCreated.mock.calls[0][0]).toBe('string');
  });
});
