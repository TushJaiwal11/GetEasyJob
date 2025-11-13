import React, { useState } from 'react';

const TestRefreshToken = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { message, type, timestamp }]);

        // Also log to console
        const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
        console.log(`${emoji} [${timestamp}] ${message}`);
    };

    const clearLogs = () => {
        setLogs([]);
        console.clear();
    };

    // Test 1: Check current tokens
    const checkTokens = () => {
        clearLogs();
        addLog('=== CHECKING TOKENS ===', 'info');

        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        const userRole = localStorage.getItem('userRole');

        if (token) {
            addLog(`JWT Token: ${token.substring(0, 50)}...`, 'success');
        } else {
            addLog('JWT Token: NOT FOUND', 'error');
        }

        if (refreshToken) {
            addLog(`Refresh Token: ${refreshToken.substring(0, 50)}...`, 'success');
        } else {
            addLog('Refresh Token: NOT FOUND', 'error');
        }

        if (userRole) {
            addLog(`User Role: ${userRole}`, 'success');
        } else {
            addLog('User Role: NOT FOUND', 'error');
        }
    };

    // Test 2: Expire token and test refresh
    const testRefresh = async () => {
        clearLogs();
        setLoading(true);

        try {
            addLog('=== TESTING TOKEN REFRESH ===', 'info');

            // Step 1: Save valid refresh token
            const validRefreshToken = localStorage.getItem('refreshToken');
            if (!validRefreshToken) {
                addLog('ERROR: No refresh token found. Please login first.', 'error');
                setLoading(false);
                return;
            }
            addLog('Valid refresh token found', 'success');

            // Step 2: Set expired JWT token
            addLog('Setting expired JWT token...', 'info');
            localStorage.setItem('token', 'expired.jwt.token.here');
            addLog('JWT token set to: expired.jwt.token.here', 'success');

            // Step 3: Import userService
            addLog('Importing userService...', 'info');
            const { default: userService } = await import('../services/userService');
            addLog('userService imported', 'success');

            // Step 4: Make API call (should trigger refresh)
            addLog('Making API call to getProfile()...', 'info');
            addLog('Expected: 401 error → auto refresh → retry', 'info');

            const profile = await userService.getProfile();

            addLog('SUCCESS! Profile received:', 'success');
            addLog(JSON.stringify(profile, null, 2), 'success');

            // Check new token
            const newToken = localStorage.getItem('token');
            if (newToken !== 'expired.jwt.token.here') {
                addLog('✅ Token was refreshed! New token saved.', 'success');
            } else {
                addLog('⚠️ Token was NOT refreshed', 'error');
            }

        } catch (error) {
            addLog('FAILED: ' + error.message, 'error');
            addLog('Full error: ' + JSON.stringify(error, null, 2), 'error');
        } finally {
            setLoading(false);
        }
    };

    // Test 3: Manual refresh call
    const manualRefresh = async () => {
        clearLogs();
        setLoading(true);

        try {
            addLog('=== MANUAL REFRESH TEST ===', 'info');

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                addLog('ERROR: No refresh token found', 'error');
                setLoading(false);
                return;
            }

            addLog('Importing authService...', 'info');
            const { default: authService } = await import('../services/authService');

            addLog('Calling authService.refreshToken()...', 'info');
            const result = await authService.refreshToken();

            addLog('SUCCESS! Refresh completed', 'success');
            addLog(JSON.stringify(result, null, 2), 'success');

            const newToken = localStorage.getItem('token');
            addLog(`New token: ${newToken?.substring(0, 50)}...`, 'success');

        } catch (error) {
            addLog('FAILED: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Token Refresh Test Page</h1>

            {/* Test Buttons */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={checkTokens}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        1. Check Tokens
                    </button>

                    <button
                        onClick={testRefresh}
                        disabled={loading}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                    >
                        {loading ? 'Testing...' : '2. Test Auto Refresh'}
                    </button>

                    <button
                        onClick={manualRefresh}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
                    >
                        {loading ? 'Refreshing...' : '3. Manual Refresh'}
                    </button>

                    <button
                        onClick={clearLogs}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Clear Logs
                    </button>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <h3 className="font-semibold mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>First, make sure you're logged in</li>
                    <li>Click "Check Tokens" to verify tokens exist</li>
                    <li>Click "Test Auto Refresh" to simulate token expiry</li>
                    <li>Watch the logs below and browser console</li>
                    <li>If refresh works, you'll see "SUCCESS!" message</li>
                </ol>
            </div>

            {/* Logs Display */}
            <div className="bg-gray-900 text-white rounded-lg p-4 font-mono text-sm">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold">Console Logs</h2>
                    <span className="text-gray-400">
                        {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
                    </span>
                </div>

                <div className="space-y-1 max-h-96 overflow-y-auto">
                    {logs.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">
                            No logs yet. Click a test button above.
                        </div>
                    ) : (
                        logs.map((log, index) => (
                            <div
                                key={index}
                                className={`py-1 ${log.type === 'success' ? 'text-green-400' :
                                        log.type === 'error' ? 'text-red-400' :
                                            'text-gray-300'
                                    }`}
                            >
                                <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                                {log.message}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Expected Output */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
                <h3 className="font-semibold mb-2">Expected Console Output (if working):</h3>
                <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                    {`🔴 INTERCEPTOR CAUGHT ERROR
Status: 401
⚠️ Token expired! Attempting to refresh...
📥 Importing authService...
🔄 Calling authService.refreshToken()...
🎯 refreshToken() METHOD CALLED!
📤 Starting token refresh...
📤 Calling API: /auth/access-token/refresh-token/...
✅ Refresh API response received
💾 Saving new JWT token to localStorage
✅ Token refresh complete!
✅ Token refreshed successfully!
🔄 Retrying original request...
✅ SUCCESS! Profile received`}
                </pre>
            </div>
        </div>
    );
};

export default TestRefreshToken;