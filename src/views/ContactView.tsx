import React, { useState } from 'react';

interface ContactViewProps {
  onNavigate: (path: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-block px-3 py-1 rounded-full bg-[#25663E] border border-[#389B5F] text-[#C5A059] text-xs font-mono font-bold tracking-widest uppercase">
          Reach Our Editorial Team
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-white tracking-wide uppercase">
          Contact <span className="text-[#389B5F]">Otaku</span><span className="text-[#C5A059]">Verse</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#A3C2AE] max-w-lg mx-auto">
          Have questions about review guidelines, community events, Discord integration, or becoming a verified critic? Reach out below.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-4 md:col-span-1">
          <div className="bg-[#0E1410] border border-[#23382C] rounded-2xl p-6 space-y-6">
            <div className="space-y-1">
              <span className="text-2xl">📬</span>
              <h3 className="font-serif font-bold text-white text-sm">Community Inquiries</h3>
              <p className="text-xs text-[#A3C2AE]">support@otakuverse.community</p>
            </div>

            <div className="space-y-1">
              <span className="text-2xl">💬</span>
              <h3 className="font-serif font-bold text-white text-sm">Discord Guild</h3>
              <p className="text-xs text-[#A3C2AE]">discord.gg/otakuverse</p>
            </div>

            <div className="space-y-1">
              <span className="text-2xl">⛩️</span>
              <h3 className="font-serif font-bold text-white text-sm">Editorial Board</h3>
              <p className="text-xs text-[#A3C2AE]">editors@otakuverse.community</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 bg-[#0E1410] border-2 border-[#23382C] rounded-2xl p-6 sm:p-8 shadow-xl">
          {submitted ? (
            <div className="p-8 text-center space-y-4">
              <div className="text-4xl">✉️</div>
              <h3 className="font-serif font-bold text-xl text-white">Message Dispatched!</h3>
              <p className="text-xs text-[#A3C2AE]">
                Thank you for reaching out, {name}. Our editorial team usually responds within 24 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                }}
                className="px-5 py-2.5 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-xl border border-[#389B5F] transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Kenji Grand Scholar"
                    className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white placeholder-[#A3C2AE]/50 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kenji@example.com"
                    className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white placeholder-[#A3C2AE]/50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1">
                  Subject Category
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white font-medium outline-none"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Review Guidelines">Review & Scoring Guidelines</option>
                  <option value="Community Guild Application">Join Community Editorial Team</option>
                  <option value="Technical Bug Report">Technical Bug Report</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A3C2AE] font-bold uppercase tracking-wider mb-1">
                  Your Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist your anime journey..."
                  className="w-full bg-[#141C17] border border-[#23382C] focus:border-[#389B5F] rounded-lg p-2.5 text-white placeholder-[#A3C2AE]/50 outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#25663E] hover:bg-[#389B5F] text-white font-bold text-xs rounded-xl border border-[#389B5F] shadow-lg transition-colors cursor-pointer uppercase tracking-wider"
              >
                Send Message ➔
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
