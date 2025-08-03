import React from 'react'
import { render, screen } from '@testing-library/react'
import { XPBar, XPGain, LevelUp } from '../XPBar'

describe('XPBar', () => {
  it('should render XP bar with correct level and progress', () => {
    render(
      <XPBar
        currentXP={150}
        currentLevel={2}
        showDetails={true}
      />
    )

    expect(screen.getByText('Level 2')).toBeInTheDocument()
    expect(screen.getByText('(150 XP)')).toBeInTheDocument()
  })

  it('should show progress to next level', () => {
    render(
      <XPBar
        currentXP={150}
        currentLevel={2}
        showDetails={true}
      />
    )

    // Level 2 requires 100 XP, Level 3 requires 400 XP
    // So progress should be 50/300 = 16.67%
    expect(screen.getByText(/250 XP to next level/)).toBeInTheDocument()
  })

  it('should render without details when showDetails is false', () => {
    render(
      <XPBar
        currentXP={150}
        currentLevel={2}
        showDetails={false}
      />
    )

    expect(screen.queryByText('Level 2')).not.toBeInTheDocument()
  })

  it('should handle different sizes', () => {
    const { rerender } = render(
      <XPBar
        currentXP={150}
        currentLevel={2}
        size="sm"
      />
    )

    // Check that the component renders without errors
    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument()

    rerender(
      <XPBar
        currentXP={150}
        currentLevel={2}
        size="lg"
      />
    )

    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument()
  })
})

describe('XPGain', () => {
  it('should render XP gain amount', () => {
    render(<XPGain amount={25} />)

    expect(screen.getByText('+25 XP')).toBeInTheDocument()
    expect(screen.getByText('⭐')).toBeInTheDocument()
  })

  it('should call onComplete after timeout', async () => {
    const mockOnComplete = jest.fn()
    
    render(<XPGain amount={25} onComplete={mockOnComplete} />)

    // Fast-forward time
    jest.advanceTimersByTime(2000)

    expect(mockOnComplete).toHaveBeenCalled()
  })
})

describe('LevelUp', () => {
  it('should render level up celebration', () => {
    render(<LevelUp newLevel={3} />)

    expect(screen.getByText('Level Up!')).toBeInTheDocument()
    expect(screen.getByText('Level 3')).toBeInTheDocument()
    expect(screen.getByText('🎉')).toBeInTheDocument()
  })

  it('should call onComplete after timeout', async () => {
    const mockOnComplete = jest.fn()
    
    render(<LevelUp newLevel={3} onComplete={mockOnComplete} />)

    // Fast-forward time
    jest.advanceTimersByTime(3000)

    expect(mockOnComplete).toHaveBeenCalled()
  })
})

// Setup for timer mocks
beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})