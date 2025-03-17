'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { bigintToNumber } from '../utils/helpers';
import { LockSquare } from 'iconoir-react';
interface MintFormProps {
  onMint: (metadata: any) => Promise<void>;
  isLoading: boolean;
  isConnected: boolean;
  userMintCount?: bigint;
  maxMintsPerAddress?: bigint;
}

interface FormData {
  name: string;
  description: string;
  image: string;
  attributes: string;
}

export default function MintForm({ 
  onMint, 
  isLoading, 
  isConnected,
  userMintCount,
  maxMintsPerAddress
}: MintFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      image: '',
      attributes: JSON.stringify([
        { trait_type: 'Background', value: 'Blue' },
        { trait_type: 'Category', value: 'Digital Art' }
      ], null, 2)
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      let parsedAttributes;
      try {
        parsedAttributes = JSON.parse(data.attributes);
      } catch (error) {
        parsedAttributes = [];
      }

      const metadata = {
        name: data.name,
        description: data.description,
        image: previewUrl || 'https://via.placeholder.com/500',
        attributes: parsedAttributes,
        file: imageFile
      };
      
      await onMint(metadata);
      reset();
      setPreviewUrl('');
      setImageFile(null);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Calculate remaining mints
  const remainingMints = maxMintsPerAddress && userMintCount 
    ? bigintToNumber(maxMintsPerAddress - userMintCount)
    : null;

  return (
    <div className="max-w-3xl mx-auto">
      {isConnected ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-100">
          {remainingMints !== null && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
              <p className="font-medium text-center">
                You have minted <span className="font-bold">{bigintToNumber(userMintCount || BigInt(0))}</span> NFTs.
                You can mint <span className="font-bold">{remainingMints}</span> more.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  NFT Name
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-base font-medium text-gray-800 bg-gray-50"
                  placeholder="My Awesome NFT"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-base font-medium text-gray-800 bg-gray-50"
                  placeholder="Describe your NFT..."
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  Upload Image <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-[184px] flex flex-col items-center justify-center hover:border-indigo-300 transition-colors bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    id="nft-image"
                    className="hidden"
                    disabled={isLoading}
                    {...register('image', { 
                      required: 'Image is required to mint NFT',
                      onChange: handleImageChange
                    })}
                  />
                  <label htmlFor="nft-image" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    {previewUrl ? (
                      <div className="flex flex-col items-center h-full w-full">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="h-[160px] object-contain rounded-lg shadow-md p-2 mt-2" 
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-700">
                          <span className="text-indigo-600 font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-600 mt-1">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  Attributes (JSON)
                </label>
                <textarea
                  {...register('attributes')}
                  rows={5}
                  className="h-[184px] w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition text-gray-800"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isLoading || (remainingMints !== null && remainingMints <= 0)}
                className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-base transition-all transform hover:scale-[1.02] ${
                  isLoading || (remainingMints !== null && remainingMints <= 0)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Minting NFT...
                  </div>
                ) : 'Mint Your NFT'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-10 text-center items-center justify-center">
          {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mx-auto text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg> */}
          <LockSquare color="#AAAAAA" strokeWidth={1} width="16em" height="16em" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to start minting NFTs</p>
        </div>
      )}
      
    </div>
  );
} 