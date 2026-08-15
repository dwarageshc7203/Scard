import React from 'react';
import { User, Banner } from '../types';
import Avatar from './ui/avatar';
import BadgeContainer from './BadgeContainer';
import ProblemsSolved from './ProblemsSolved';
import { Mail, Globe } from 'lucide-react';

interface ExportCardProps {
  user: User;
  banner: Banner | undefined;
}

const ExportCard: React.FC<ExportCardProps> = ({ user, banner }) => {
  const latestRating = user.contests && user.contests.length > 0
    ? user.contests[user.contests.length - 1].rating
    : null;

  return (
    <div id="export-card-node" className="w-[800px] bg-white rounded-3xl overflow-hidden shadow-2xl font-sans relative flex flex-col p-6 gap-6" style={{ background: '#f9fafb' }}>
      
      {/* Banner & Profile Info */}
      <div className="relative pt-[40px] px-6">
        <div
          className="absolute top-0 left-0 right-0 h-[200px] bg-white rounded-2xl shadow-sm border border-gray-200"
          style={banner ? { background: banner.cssBackground, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {user.customSocials && user.customSocials.length > 0 && (
            <div className="absolute bottom-4 right-4 flex gap-2 z-20">
              {user.customSocials.map((social, idx) => (
                <div key={idx} className="p-2 bg-white/50 backdrop-blur-md rounded-full border border-gray-200 text-gray-800 shadow-sm">
                   {social.type.toLowerCase() === 'linkedin' ? (
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    ) :
                    social.type.toLowerCase() === 'twitter' ? (
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    ) :
                    (social.type.toLowerCase() === 'email' || social.type.toLowerCase() === 'mail') ? <Mail className="w-4 h-4" /> :
                    <Globe className="w-4 h-4" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative px-8 flex items-end -mt-8 pt-[120px]">
          <div className="rounded-full bg-gray-50 p-2 -ml-2 shadow-sm border border-gray-200">
            <Avatar initials={user.initials} color={user.color} src={user.imageURL} asciiArt={user.asciiArt} size="xl" isOnline={false} />
          </div>
          <div className="ml-6 pb-2 pb-6">
            <h1 className="text-3xl font-black text-gray-900 leading-tight flex items-center gap-2">
              {user.displayName}
            </h1>
            <p className="text-gray-500 font-medium">@{user.username}</p>
            {user.designation && <p className="text-gray-700 mt-2 font-medium">{user.designation}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 px-6 pb-6">
        {latestRating && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col items-center justify-center min-h-[200px]">
             <span className="text-[15px] text-gray-500 absolute top-5 left-6">Contest Rating</span>
             <span className="text-5xl font-black text-gray-900">{latestRating}</span>
          </div>
        )}
        
        {user.problemsSolved && Object.keys(user.problemsSolved).length > 0 && (
          <div className="h-full">
            <ProblemsSolved problems={user.problemsSolved} />
          </div>
        )}
      </div>

      {user.badges && user.badges.length > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-white border border-gray-200 rounded-[20px] p-6 min-h-[200px] shadow-sm">
            <span className="text-[15px] text-gray-500 mb-4 block">Badges</span>
            <BadgeContainer badges={user.badges} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportCard;
