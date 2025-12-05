'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { portfolioAPI, familyAPI } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Portfolio {
  portfolio_id: number;
  portfolio_name: string;
  member_id: number;
}

interface FamilyMember {
  member_id: number;
  name: string;
  relation: string;
}

interface AssetClass {
  asset_class_id: number;
  name: string;
}

export default function AddInvestmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [assetClasses, setAssetClasses] = useState<AssetClass[]>([]);
  
  const [formData, setFormData] = useState({
    portfolio_id: '',
    member_id: '',
    asset_class_id: '',
    name: '',
    symbol: '',
    folio_number: '',
    invested_value: '',
    current_value: '',
    units: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [portfoliosRes, membersRes, assetClassesRes] = await Promise.all([
        portfolioAPI.getAllPortfolios(),
        familyAPI.getAllMembers(),
        portfolioAPI.getAssetClasses(),
      ]);
      
      setPortfolios(portfoliosRes.data);
      setMembers(membersRes.data);
      setAssetClasses(assetClassesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await portfolioAPI.createInvestment({
        portfolio_id: parseInt(formData.portfolio_id),
        member_id: parseInt(formData.member_id),
        asset_class_id: parseInt(formData.asset_class_id),
        name: formData.name,
        symbol: formData.symbol || undefined,
        folio_number: formData.folio_number || undefined,
        invested_value: parseFloat(formData.invested_value),
        current_value: parseFloat(formData.current_value),
        units: formData.units ? parseFloat(formData.units) : undefined,
      });

      router.push('/portfolio');
    } catch (error) {
      console.error('Error creating investment:', error);
      alert('Failed to create investment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Investment</h1>
          <p className="text-gray-600 mt-2">Enter the details of your new investment</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Investment Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., HDFC Bluechip Fund"
                />
              </div>

              {/* Portfolio Selection */}
              <div>
                <label htmlFor="portfolio_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio *
                </label>
                <select
                  id="portfolio_id"
                  name="portfolio_id"
                  required
                  value={formData.portfolio_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a portfolio</option>
                  {portfolios.map((portfolio) => (
                    <option key={portfolio.portfolio_id} value={portfolio.portfolio_id}>
                      {portfolio.portfolio_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Member Selection */}
              <div>
                <label htmlFor="member_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Family Member *
                </label>
                <select
                  id="member_id"
                  name="member_id"
                  required
                  value={formData.member_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a family member</option>
                  {members.map((member) => (
                    <option key={member.member_id} value={member.member_id}>
                      {member.name} ({member.relation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Asset Class Selection */}
              <div>
                <label htmlFor="asset_class_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Class *
                </label>
                <select
                  id="asset_class_id"
                  name="asset_class_id"
                  required
                  value={formData.asset_class_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an asset class</option>
                  {assetClasses.map((assetClass) => (
                    <option key={assetClass.asset_class_id} value={assetClass.asset_class_id}>
                      {assetClass.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Symbol */}
              <div>
                <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-2">
                  Symbol / Ticker
                </label>
                <input
                  type="text"
                  id="symbol"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., HDFC-BLUE, TCS"
                />
              </div>

              {/* Folio Number */}
              <div>
                <label htmlFor="folio_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Folio Number
                </label>
                <input
                  type="text"
                  id="folio_number"
                  name="folio_number"
                  value={formData.folio_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., FOLIO001"
                />
              </div>

              {/* Invested Value */}
              <div>
                <label htmlFor="invested_value" className="block text-sm font-medium text-gray-700 mb-2">
                  Invested Amount (₹) *
                </label>
                <input
                  type="number"
                  id="invested_value"
                  name="invested_value"
                  required
                  step="0.01"
                  min="0"
                  value={formData.invested_value}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100000"
                />
              </div>

              {/* Current Value */}
              <div>
                <label htmlFor="current_value" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Value (₹) *
                </label>
                <input
                  type="number"
                  id="current_value"
                  name="current_value"
                  required
                  step="0.01"
                  min="0"
                  value={formData.current_value}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="120000"
                />
              </div>

              {/* Units */}
              <div>
                <label htmlFor="units" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Units
                </label>
                <input
                  type="number"
                  id="units"
                  name="units"
                  step="0.001"
                  min="0"
                  value={formData.units}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  {loading ? 'Creating...' : 'Create Investment'}
                </button>
                <Link
                  href="/portfolio"
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium text-center transition"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
