import React, { useState, useEffect } from 'react';
import { FiUsers, FiUserPlus, FiEdit2, FiSave, FiX, FiCheck } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTarget, setEditingTarget] = useState({ id: null, value: '' });
  
  // For new user modal
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '', email: '', password: '', role: 'associate', target: 0
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users || res.data || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveTarget = async (id) => {
    try {
      await api.patch(`/users/${id}/target`, { target: Number(editingTarget.value) });
      toast.success('Target updated successfully');
      setUsers(users.map(u => u._id === id ? { ...u, target: Number(editingTarget.value) } : u));
      setEditingTarget({ id: null, value: '' });
    } catch (err) {
      toast.error('Failed to update target');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newUser, target: Number(newUser.target) };
      await api.post('/users', payload);
      toast.success('User created successfully');
      setShowModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'associate', target: 0 });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-bg-tertiary rounded"></div>
        <div className="h-[500px] bg-bg-secondary border border-border rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1 flex items-center">
            <FiUsers className="mr-3 text-accent" /> User Management
          </h1>
          <p className="text-text-secondary">Manage system users, roles, and sales targets.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-accent hover:bg-accent-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-accent/20"
        >
          <FiUserPlus className="mr-2" /> Add User
        </button>
      </div>

      <div className="bg-bg-secondary border border-border rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-tertiary text-text-secondary text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Monthly Target (₹)</th>
                <th className="p-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-bg-tertiary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold mr-3">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-text-primary">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-text-secondary">{user.email}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium border ${
                      user.role === 'admin' ? 'bg-accent-danger/10 text-accent-danger border-accent-danger/20' :
                      user.role === 'manager' ? 'bg-accent/10 text-accent border-accent/20' :
                      'bg-bg-tertiary text-text-secondary border-border'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {editingTarget.id === user._id ? (
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          value={editingTarget.value}
                          onChange={(e) => setEditingTarget({ ...editingTarget, value: e.target.value })}
                          className="bg-bg-tertiary border border-accent text-text-primary px-2 py-1 rounded w-32 outline-none text-sm"
                          autoFocus
                        />
                        <button 
                          onClick={() => handleSaveTarget(user._id)}
                          className="ml-2 text-success hover:text-success/80 transition-colors"
                        >
                          <FiCheck size={18} />
                        </button>
                        <button 
                          onClick={() => setEditingTarget({ id: null, value: '' })}
                          className="ml-2 text-text-secondary hover:text-text-primary transition-colors"
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center text-text-primary">
                        <span className="w-32">{user.target > 0 ? `₹${user.target.toLocaleString('en-IN')}` : 'Not set'}</span>
                        <button 
                          onClick={() => setEditingTarget({ id: user._id, value: user.target || 0 })}
                          className="text-text-secondary hover:text-accent transition-colors ml-2"
                        >
                          <FiEdit2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {/* Placeholder for future actions like edit user details, disable account */}
                    <span className="text-text-secondary text-sm">--</span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-text-secondary">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bg-secondary border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-bg-tertiary/50">
              <h2 className="text-lg font-semibold text-text-primary">Add New User</h2>
              <button onClick={() => setShowModal(false)} className="text-text-secondary hover:text-text-primary transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                  <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                  <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                  <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} minLength={6}
                    className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-accent outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                    <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-accent outline-none">
                      <option value="associate">Associate</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Monthly Target (₹)</label>
                    <input type="number" min="0" value={newUser.target} onChange={e => setNewUser({...newUser, target: e.target.value})}
                      className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-accent outline-none" />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary">Cancel</button>
                <button type="submit" className="bg-accent hover:bg-accent-secondary text-white px-5 py-2 rounded-lg text-sm font-medium shadow-lg shadow-accent/20">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
