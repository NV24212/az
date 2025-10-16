import { useState } from 'react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="flex border-b">
        <button
          className={`py-2 px-4 ${activeTab === 'general' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'delivery' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('delivery')}
        >
          Delivery & Payment
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'messages' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Custom Messages
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'account' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
      </div>
      <div className="pt-4">
        {activeTab === 'general' && <div>General Settings Content</div>}
        {activeTab === 'delivery' && <div>Delivery & Payment Settings Content</div>}
        {activeTab === 'messages' && <div>Custom Messages Settings Content</div>}
        {activeTab === 'account' && <div>Account Settings Content</div>}
      </div>
    </div>
  );
};

export default SettingsPage;