interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
        <h2 className="text-red-800 text-xl font-bold mb-2">Error Loading Data</h2>
        <p className="text-red-600">{message}</p>
      </div>
    </div>
  );
}
