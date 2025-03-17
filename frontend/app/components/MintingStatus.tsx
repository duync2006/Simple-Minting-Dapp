'use client';

import { formatNumber } from '../utils/helpers';

interface MintingStatusProps {
  stats: {
    totalSupply: number;
    maxSupply: number;
    totalOwners: number;
  } | null;
}

export default function MintingStatus({ stats }: MintingStatusProps) {
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Minting Status</h2>
        <p className="text-gray-500">Loading minting statistics...</p>
      </div>
    );
  }

  const { totalSupply, maxSupply, totalOwners } = stats;
  const percentMinted = (totalSupply / maxSupply) * 100;

  return (
    <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Minting Status</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-sm text-indigo-600 mb-1">Total Minted</p>
          <p className="text-2xl font-bold text-indigo-800">
            {formatNumber(totalSupply)}
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 mb-1">Max Supply</p>
          <p className="text-2xl font-bold text-green-800">
            {formatNumber(maxSupply)}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600 mb-1">Unique Owners</p>
          <p className="text-2xl font-bold text-purple-800">
            {formatNumber(totalOwners)}
          </p>
        </div>
      </div>
      
      <div className="mb-2 flex justify-between text-sm text-gray-600">
        <span>Progress</span>
        <span>{percentMinted.toFixed(1)}% Complete</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full" 
          style={{ width: `${percentMinted}%` }}
        ></div>
      </div>
    </div>
  );
} 