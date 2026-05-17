import React from 'react';

const Table = ({ columns, data, isLoading, emptyMessage = "No data found", searchQuery = "" }) => {
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(item => 
      Object.values(item).some(val => 
        val && val.toString().toLowerCase().includes(query)
      )
    );
  }, [data, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-secondary-50 dark:bg-secondary-800 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="py-12 text-center bg-secondary-50 dark:bg-secondary-800/50 rounded-3xl border-2 border-dashed border-secondary-200 dark:border-secondary-700">
        <p className="text-secondary-500 dark:text-secondary-400 font-medium">{searchQuery ? "No matches found for your search." : emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-secondary-100 dark:border-secondary-700/50">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-secondary-50/50 dark:bg-secondary-800/50">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className="px-6 py-4 text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-100 dark:divide-secondary-700/50">
          {filteredData.map((row, rowIdx) => (
            <tr 
              key={rowIdx} 
              className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors duration-150"
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-6 py-4 text-sm text-secondary-700 dark:text-secondary-300 font-medium">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
