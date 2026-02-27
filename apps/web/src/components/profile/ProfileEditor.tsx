'use client';

import React, { useState } from 'react';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  role: 'student' | 'verifier' | 'admin' | 'camp_coordinator';
}

interface ProfileEditorProps {
  initialData?: Partial<ProfileFormData>;
  onSave: (data: ProfileFormData) => void;
  onCancel: () => void;
}

export function ProfileEditor({ initialData, onSave, onCancel }: ProfileEditorProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    bio: initialData?.bio || '',
    location: initialData?.location || '',
    role: initialData?.role || 'student',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-[#0f4c3a] mb-4">
        {initialData?.name ? 'Edit Profile / ꯍꯛꯆꯥꯔꯣꯜ ꯁꯦꯝꯕ' : 'Create Profile / ꯅꯠꯅꯕ ꯄ꯭ꯔꯣꯐꯥꯏꯜ ꯁꯦꯝꯕ'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name / ꯃꯤꯡ
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4c3a] focus:border-transparent"
            placeholder="Enter your name / ꯅꯥꯡ ꯍꯥꯜꯂꯣ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email / ꯏꯃꯦꯜ
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4c3a] focus:border-transparent"
            placeholder="Enter email / ꯏꯃꯦꯜ ꯍꯥꯜꯂꯣ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone / ꯄꯣꯟ ꯅꯝꯕꯔ
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4c3a] focus:border-transparent"
            placeholder="+91 phone number / ꯄꯣꯟ ꯅꯝꯕꯔ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location / ꯂꯣꯀꯦꯁꯟ
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4c3a] focus:border-transparent"
            placeholder="Enter location / ꯂꯣꯀꯦꯁꯟ ꯍꯥꯜꯂꯣ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role / ꯔꯣꯜ
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4c3a] focus:border-transparent"
          >
            <option value="student">Student / ꯍꯥꯡꯕ</option>
            <option value="verifier">Verifier / ꯌꯦꯡꯕ ꯆꯤꯡꯕ</option>
            <option value="camp_coordinator">Camp Coordinator / ꯀꯦꯝꯄ ꯀꯣꯑ꯭ꯔꯗꯤꯅꯦꯇꯔ</option>
            <option value="admin">Admin / ꯑꯗꯃꯤꯟ</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio / ꯕꯥꯏꯣ
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f4c3a] focus:border-transparent"
            placeholder="Tell us about yourself / ꯅꯥꯡꯒꯤ ꯕꯥꯏꯣ ꯍꯥꯜꯂꯣ"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-[#0f4c3a] text-white px-4 py-2 rounded-md hover:bg-[#0a3d2e] transition-colors font-medium"
          >
            Save / ꯁꯦꯝꯕ
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel / ꯇꯣꯛꯂꯕ
          </button>
        </div>
      </form>
    </div>
  );
}
