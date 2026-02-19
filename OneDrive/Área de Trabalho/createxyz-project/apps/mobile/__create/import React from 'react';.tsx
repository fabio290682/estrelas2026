import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { DeviceErrorBoundaryWrapper } from './DeviceErrorBoundary';

// Mocks
vi.mock('expo-updates', () => ({
    reloadAsync: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('expo-router/build/exports', () => ({
    SplashScreen: {
        hideAsync: vi.fn().mockResolvedValue(undefined),
    },
}));
vi.mock('react-native', () => ({
    Platform: { OS: 'ios' },
    View: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('./SharedErrorBoundary', () => ({
    SharedErrorBoundary: ({ children, description }: any) => (
        <div>
            <span data-testid="description">{description}</span>
            {children}
        </div>
    ),
    Button: ({ children, onPress }: any) => (
        <button onClick={onPress}>{children}</button>
    ),
}));
const reportErrorToRemoteMock = vi.fn().mockResolvedValue({ success: true });
vi.mock('./report-error-to-remote', () => ({
    reportErrorToRemote: reportErrorToRemoteMock,
}));


describe('DeviceErrorBoundaryWrapper', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders children when no error', () => {
        const { getByTestId } = render(
            <DeviceErrorBoundaryWrapper>
                <div data-testid="child">Child</div>
            </DeviceErrorBoundaryWrapper>
        );
        expect(getByTestId('child')).toBeTruthy();
    });

    it('renders error boundary when error occurs', () => {
        // Simulate error by directly setting state
        const wrapper = render(
            <DeviceErrorBoundaryWrapper>
                <div>Child</div>
            </DeviceErrorBoundaryWrapper>
        );
        // @ts-ignore
        wrapper.rerender(
            <DeviceErrorBoundaryWrapper>
                {(() => {
                    throw new Error('Test error');
                })()}
            </DeviceErrorBoundaryWrapper>
        );
        expect(wrapper.getByText('Restart app')).toBeTruthy();
    });

    it('shows correct description when sentLogs is true', async () => {
        reportErrorToRemoteMock.mockResolvedValueOnce({ success: true });
        const wrapper = render(
            <DeviceErrorBoundaryWrapper>
                <div>Child</div>
            </DeviceErrorBoundaryWrapper>
        );
        // @ts-ignore
        wrapper.rerender(
            <DeviceErrorBoundaryWrapper>
                {(() => {
                    throw new Error('Test error');
                })()}
            </DeviceErrorBoundaryWrapper>
        );
        expect(wrapper.getByTestId('description').textContent).toMatch(/reported to the AI agent/);
    });

    it('shows correct description when sentLogs is false', async () => {
        reportErrorToRemoteMock.mockResolvedValueOnce({ success: false });
        const wrapper = render(
            <DeviceErrorBoundaryWrapper>
                <div>Child</div>
            </DeviceErrorBoundaryWrapper>
        );
        // @ts-ignore
        wrapper.rerender(
            <DeviceErrorBoundaryWrapper>
                {(() => {
                    throw new Error('Test error');
                })()}
            </DeviceErrorBoundaryWrapper>
        );
        expect(wrapper.getByTestId('description').textContent).toMatch(/Please see create\.xyz\/docs for help/);
    });

    it('calls SplashScreen.hideAsync on mount', () => {
        render(
            <DeviceErrorBoundaryWrapper>
                <div>Child</div>
            </DeviceErrorBoundaryWrapper>
        );
        expect(require('expo-router/build/exports').SplashScreen.hideAsync).toHaveBeenCalled();
    });

    it('calls Updates.reloadAsync when Restart app is pressed (native)', () => {
        const { getByText } = render(
            <DeviceErrorBoundaryWrapper>
                <div>Child</div>
            </DeviceErrorBoundaryWrapper>
        );
        fireEvent.click(getByText('Restart app'));
        expect(require('expo-updates').reloadAsync).toHaveBeenCalled();
    });

    it('calls window.location.reload when Restart app is pressed (web)', () => {
        require('react-native').Platform.OS = 'web';
        window.location.reload = vi.fn();
        const { getByText } = render(
            <DeviceErrorBoundaryWrapper>
                <div>Child</div>
            </DeviceErrorBoundaryWrapper>
        );
        fireEvent.click(getByText('Restart app'));
        expect(window.location.reload).toHaveBeenCalled();
    });

    it('calls reportErrorToRemote when error occurs', () => {
        const wrapper = render(
            <DeviceErrorBoundaryWrapper>
                <div>Child</div>
            </DeviceErrorBoundaryWrapper>
        );
        // @ts-ignore
        wrapper.rerender(
            <DeviceErrorBoundaryWrapper>
                {(() => {
                    throw new Error('Test error');
                })()}
            </DeviceErrorBoundaryWrapper>
        );
        expect(reportErrorToRemoteMock).toHaveBeenCalled();
    });

    it('handles reportErrorToRemote rejection gracefully', async () => {
        reportErrorToRemoteMock.mockRejectedValueOnce(new Error('Network error'));
        const wrapper = render(
            <DeviceErrorBoundaryWrapper>
                <div>Child</div>
            </DeviceErrorBoundaryWrapper>
        );
        // @ts-ignore
        wrapper.rerender(
            <DeviceErrorBoundaryWrapper>
                {(() => {
                    throw new Error('Test error');
                })()}
            </DeviceErrorBoundaryWrapper>
        );
        expect(wrapper.getByTestId('description').textContent).toMatch(/Please see create\.xyz\/docs for help/);
    });
});