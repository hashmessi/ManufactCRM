import React, { useState, useEffect } from 'react';
import { FiUsers, FiUserPlus, FiEdit2, FiSave, FiX, FiCheck, FiShield, FiAlertTriangle } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
  admin:     { label: 'Admin',     color: 'text-danger',  bg: 'bg-danger/10 border-danger/25'   },
  manager:   { label: 'Manager',   color: 'text-accent',  bg: 'bg-accent/10 border-accent/25'   },
  associate: { label: 'Associate', color: 'text-success', bg: 'bg-success/10 border-success/25' },
};

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].charAt(0).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTarget, setEditingTarget] = useState({ id: null, value: '' });
  const [saving, setSaving] = useState(false);

  // New user modal state
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '', email: '', password: '', role: 'associate', target: 0,
  });
  const [creating, setCreating] = useState(false);

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
    const value = Number(editingTarget.value);
    if (isNaN(value) || value < 0) {
      toast.error('Please enter a valid target amount');
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/users/${id}/target`, { target: value });
      toast.success('Target updated');
      setUsers(users.map(u => u._id === id ? { ...u, target: value } : u));
      setEditingTarget({ id: null, value: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update target');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = { ...newUser, target: Number(newUser.target) };
      await api.post('/users', payload);
      toast.success('User created successfully');
      setShowModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'associate', target: 0 });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-9 w-52 bg-bg-tertiary/40 rounded-xl" />
        <div className="h-[500px] bg-bg-secondary/30 border border-border/40 rounded-xl" />
      </div>
    );
  }

  const roleCount = {
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    associate: users.filter(u => u.role === 'associate').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary tracking-tight flex items-center gap-2">
            <FiShield className="w-4 h-4 text-accent" />
            User Management
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage team members, roles, and monthly revenue targets.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
          id="add-user-btn"
        >
          <FiUserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Summary Pills */}
      <div className="flex items-center gap-3 flex-wrap">
        {Object.entries(roleCount).map(([role, count]) => {
          const cfg = ROLE_CONFIG[role];
          return (
            <div key={role} className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
              <span>{count}</span>
              <span className="capitalize">{cfg.label}{count !== 1 ? 's' : ''}</span>
            </div>
          );
        })}
        <div className="ml-auto text-[11px] text-text-muted font-mono bg-bg-tertiary/40 border border-border/40 px-3 py-1.5 rounded-lg">
          {users.length} total users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-bg-secondary/40 border border-border/60 rounded-xl overflow-hidden shadow-premium-card">
        <div className="overflow-x-auto dense-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-tertiary/40 border-b border-border/60 text-[10px] font-mono font-semibold text-text-muted uppercase tracking-wider">
                <th className="py-3.5 px-5">Team Member</th>
                <th className="py-3.5 px-5">Email</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">Monthly Target (₹)</th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {users.map((user) => {
                const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.associate;
                const initials = getInitials(user.name);
                return (
                  <tr key={user._id} className="hover:bg-bg-tertiary/20 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${roleConf.bg} ${roleConf.color}`}>
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-text-primary">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-sm text-text-muted font-mono">{user.email}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${roleConf.bg} ${roleConf.color}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {editingTarget.id === user._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editingTarget.value}
                            onChange={(e) => setEditingTarget({ ...editingTarget, value: e.target.value })}
                            className="input-dark w-36 py-1.5 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveTarget(user._id);
                              if (e.key === 'Escape') setEditingTarget({ id: null, value: '' });
                            }}
                          />
                          <button
                            onClick={() => handleSaveTarget(user._id)}
                            disabled={saving}
                            className="p-1.5 rounded-lg bg-success/10 border border-success/20 text-success hover:bg-success/20 transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            <FiCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingTarget({ id: null, value: '' })}
                            className="p-1.5 rounded-lg bg-bg-tertiary border border-border/60 text-text-muted hover:text-text-primary transition-colors"
                            title="Cancel"
                          >
                            <FiX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group/target">
                          <span className="text-sm font-mono text-text-primary tabular-nums">
                            {user.target > 0 ? `₹${user.target.toLocaleString('en-IN')}` : (
                              <span className="text-text-muted italic text-xs">Not set</span>
                            )}
                          </span>
                          <button
                            onClick={() => setEditingTarget({ id: user._id, value: user.target || 0 })}
                            className="opacity-0 group-hover/target:opacity-100 p-1 rounded text-text-muted hover:text-accent transition-all"
                            title="Edit target"
                          >
                            <FiEdit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5 text-center">
                      {user.role !== 'admin' ? (
                        <button
                          onClick={() => setEditingTarget({ id: user._id, value: user.target || 0 })}
                          className="text-[10px] font-semibold text-text-muted hover:text-accent bg-bg-tertiary/40 border border-border/40 hover:border-accent/30 px-2.5 py-1 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          Edit Target
                        </button>
                      ) : (
                        <span className="text-[10px] text-text-muted font-mono flex items-center justify-center gap-1">
                          <FiShield className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-text-muted text-sm">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content w-full max-w-md animate-slideUp">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Add New User</h2>
                <p className="text-xs text-text-muted mt-0.5">Create a new team member account.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Full Name</label>
                <input
                  required
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  className="input-dark"
                  placeholder="Priya Sharma"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Email Address</label>
                <input
                  required
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  className="input-dark"
                  placeholder="priya@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Password</label>
                <input
                  required
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  minLength={6}
                  className="input-dark"
                  placeholder="Min. 6 characters"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Role</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    className="input-dark"
                  >
                    <option value="associate">Associate</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Monthly Target (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newUser.target}
                    onChange={e => setNewUser({ ...newUser, target: e.target.value })}
                    className="input-dark"
                    placeholder="5000000"
                  />
                </div>
              </div>

              {newUser.role === 'admin' && (
                <div className="flex items-start gap-2 bg-warning/5 border border-warning/20 rounded-lg p-3 text-xs text-warning">
                  <FiAlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>Admin users have full access to all records, users, and system settings.</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-border/40 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  {creating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="w-3.5 h-3.5" />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
