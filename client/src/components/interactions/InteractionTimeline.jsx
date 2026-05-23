import React, { useState } from 'react';
import { FiPhone, FiMail, FiUsers, FiMessageCircle, FiFileText } from 'react-icons/fi';

const typeIcons = {
  call: <FiPhone className="text-accent-secondary" />,
  email: <FiMail className="text-accent-info" />,
  meeting: <FiUsers className="text-success" />,
  whatsapp: <FiMessageCircle className="text-success" />,
  other: <FiFileText className="text-text-secondary" />
};

export default function InteractionTimeline({ interactions = [], onLogClick }) {
  const [filter, setFilter] = useState('all');
  const [sortDesc, setSortDesc] = useState(true);

  const filtered = interactions.filter(i => filter === 'all' || i.type === filter);
  const sorted = [...filtered].sort((a, b) => {
    const d1 = new Date(a.date).getTime();
    const d2 = new Date(b.date).getTime();
    return sortDesc ? d2 - d1 : d1 - d2;
  });

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5 shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Timeline</h2>
          <p className="text-sm text-text-secondary">{interactions.length} interactions</p>
        </div>
        <button 
          onClick={onLogClick}
          className="bg-accent hover:bg-accent-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Log Interaction
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <select 
          className="bg-bg-tertiary border border-border text-text-primary rounded-lg px-3 py-1.5 text-sm outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="call">Calls</option>
          <option value="email">Emails</option>
          <option value="meeting">Meetings</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="other">Other</option>
        </select>
        <button 
          onClick={() => setSortDesc(!sortDesc)}
          className="bg-bg-tertiary border border-border text-text-primary rounded-lg px-3 py-1.5 text-sm hover:bg-bg-primary transition-colors"
        >
          {sortDesc ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {sorted.length === 0 ? (
          <div className="text-center text-text-secondary py-10">
            <FiFileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No interactions found.</p>
          </div>
        ) : (
          <div className="relative border-l border-border ml-3 space-y-6 pb-4">
            {sorted.map((item) => (
              <div key={item._id} className="relative pl-6">
                <div className="absolute -left-3.5 top-1 bg-bg-secondary border border-border rounded-full p-1.5 shadow-sm">
                  {typeIcons[item.type] || typeIcons.other}
                </div>
                <div className="bg-bg-tertiary border border-border rounded-lg p-4 transition-all hover:border-accent/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-text-primary capitalize">{item.type}</span>
                    <span className="text-xs text-text-secondary">
                      {new Date(item.date).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {item.duration && (
                    <div className="text-xs text-text-secondary mb-2">
                      Duration: {item.duration} mins
                    </div>
                  )}
                  <p className="text-sm text-text-primary mb-3 whitespace-pre-wrap">{item.outcome}</p>
                  {item.nextAction && (
                    <div className="text-sm bg-bg-secondary p-2 rounded border border-border/50 text-text-secondary flex items-start">
                      <span className="font-medium text-text-primary mr-2">Next:</span>
                      {item.nextAction}
                    </div>
                  )}
                  <div className="mt-3 text-xs text-text-secondary text-right">
                    Logged by <span className="font-medium text-text-primary">{item.loggedBy?.name || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
