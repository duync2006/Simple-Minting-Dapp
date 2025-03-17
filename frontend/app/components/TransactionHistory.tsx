"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Transaction {
  hash: string;
  type: string;
  tokenId: number;
  status: string;
  timestamp: string;
  from: string;
  to: string;
  blockNumber: number;
  gasUsed: number;
  contractAddress: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchTransactions();

    // Auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      setPage(1); // Reset to page 1 to get latest transactions
      fetchTransactions();
    }, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchTransactions = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${apiUrl}/transactions`, {
        params: {
          page,
          limit: 10,
        },
      });

      if (response.data && response.data.status === "success") {
        if (page === 1) {
          setTransactions(response.data.data);
        } else {
          setTransactions((prev) => [...prev, ...response.data.data]);
        }

        // Check if there are more transactions to load
        setHasMore(
          response.data.pagination.page < response.data.pagination.pages
        );
      } else {
        setError("Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Error fetching transactions. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1);
    fetchTransactions();
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Transaction History
      </h2>

      {isLoading && transactions.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-500">{error}</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-600">No transactions found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Transaction Hash
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    From
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    To
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Token ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.hash} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 underline">
                      <span
                        className="cursor-pointer hover:text-blue-700"
                        onClick={() =>
                          window.open(
                            `https://etherscan.io/tx/${tx.hash}`,
                            "_blank"
                          )
                        }
                      >
                        {formatAddress(tx.hash)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatAddress(tx.from)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatAddress(tx.to)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{tx.tokenId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tx.status === "confirmed" || tx.status === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(tx.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="mt-4 text-center">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
