import ExampleDataList from '@/components/ExampleDataList';

export const metadata = {
  title: 'Example Data',
  description: 'Example page with mock data that will eventually use Supabase',
};

export default function ExamplesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Example Data Page</h1>
      <p className="mb-6">
        This page displays example data that will eventually come from Supabase.
      </p>
      
      <ExampleDataList />
    </div>
  );
} 