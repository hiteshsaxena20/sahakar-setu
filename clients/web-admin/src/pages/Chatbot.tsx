import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const mockMessages = [
  { role: 'assistant', content: 'Hello! I\'m your career guide for the cooperative sector. Ask me about jobs, skills, or training programmes!' },
  { role: 'user', content: 'What jobs can I get after dairy certification?' },
  { role: 'assistant', content: 'With a dairy cooperative certification, you can pursue roles like:\n\n• **Dairy Supervisor** - Oversee milk collection, quality control\n• **Cooperative Field Officer** - Work with farmer members\n• **Quality Assurance Officer** - Ensure milk standards\n• **Procurement Officer** - Manage milk procurement\n• **Plant Operator** - Process dairy products\n\nMajor employers: Amul, Mother Dairy, NABARD, state cooperative federations.\n\nWould you like me to search for current openings?' },
];

export function Chatbot() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Based on your dairy certification, I recommend applying for Dairy Supervisor positions at Amul and Mother Dairy. These roles match your skills in quality control and cooperative management.',
        'For cooperative management roles, key skills include: financial reporting, member relations, governance compliance, and audit preparation. Your certificate covers these areas.',
        'Current openings matching your profile:\n1. Dairy Supervisor - Amul (Anand)\n2. Field Officer - NABARD (Pune)\n3. Quality Analyst - Mother Dairy (Delhi)\n\nWould you like help preparing your application?',
        'The NCCT offers advanced programmes in:\n• Dairy Technology & Processing\n• Cooperative Banking & Finance\n• Agri-Business Management\n\nThese can enhance your career prospects significantly.'
      ];
      
      const botResponse = {
        role: 'assistant' as const,
        content: responses[Math.floor(Math.random() * responses.length)]
      };
      
      setMessages(prev => [...prev, botResponse]);
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary-600" />
            {t('navigation.chatbot')}
          </h1>
          <p className="text-gray-500 mt-1">{t('employment.chatbot_welcome')}</p>
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="flex flex-col h-[600px]">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            Career Guide Assistant
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${message.role === 'user' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
                <div className="prose prose-sm max-w-none">{message.content}</div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-none animate-pulse">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card-body pt-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('employment.ask_question')}
              disabled={loading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={loading || !input.trim()}
              className="btn-primary"
              rightIcon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            >
              {t('common.send')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Suggestions */}
      <Card>
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">{t('employment.quick_questions') || 'Quick Questions'}</h3>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-2">
            {[
              'What jobs after dairy certification?',
              'How to improve my match score?',
              'Which skills are in demand?',
              'Upcoming training programmes?'
            ].map((q, i) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setInput(q);
                  handleSend();
                }}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}