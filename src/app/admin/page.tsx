'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/rentals', {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });
      if (res.ok) {
        const data = await res.json() as any;
        setRentals(data.data || []);
      } else {
        alert('Authentication failed or error fetching rentals');
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    fetchRentals();
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/admin/rentals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        alert('Rental approved!');
        fetchRentals();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to reject and delete this rental?')) return;
    try {
      const res = await fetch('/api/admin/rentals', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        alert('Rental rejected!');
        fetchRentals();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="sr-only">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pending Rentals</h1>
          <button 
            onClick={() => fetchRentals()}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading pending rentals...</p>
        ) : rentals.length === 0 ? (
          <p className="text-gray-500">No pending rentals waiting for approval.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rentals.map((rental) => (
              <div key={rental.id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
                <div className="px-6 py-4 flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {rental.city}{rental.district} - {rental.type}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{rental.address}</p>
                  
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Price:</span> ${rental.price}/month</p>
                    <p><span className="font-semibold">Layout:</span> {rental.layout}</p>
                    <p><span className="font-semibold">Area:</span> {rental.area} 坪</p>
                    <p><span className="font-semibold">Floor:</span> {rental.floor}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Submitted: {new Date(rental.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between space-x-3">
                  <button
                    onClick={() => handleApprove(rental.id)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDelete(rental.id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
