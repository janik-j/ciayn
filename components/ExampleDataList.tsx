'use client';

import { useState, useEffect } from 'react';
// We'll import Supabase client when it's properly installed
// import { supabase } from '@/lib/supabase/client';

export default function ExampleDataList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // For now, we'll just simulate data until Supabase is fully integrated
        // const { data, error } = await supabase
        //   .from('example_table')
        //   .select('*');
        
        // if (error) throw new Error(error.message);
        
        // Mock data for now
        const mockData = [
          { id: 1, title: 'Item 1', content: 'This is item 1' },
          { id: 2, title: 'Item 2', content: 'This is item 2' },
          { id: 3, title: 'Item 3', content: 'This is item 3' },
        ];
        
        setData(mockData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) return <div>Loading data...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Example Data</h2>
      <div className="grid gap-4">
        {data.map((item) => (
          <div key={item.id} className="border p-4 rounded-md">
            <h3 className="font-semibold">{item.title}</h3>
            <p>{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 