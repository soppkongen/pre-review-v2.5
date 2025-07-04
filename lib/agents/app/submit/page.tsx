'use client';

import { useState } from 'react';

export default function SubmitPage() {
  const [result, setResult] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;
    if (!fileInput.files?.[0]) return;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const res = await fetch('/api/analysis/start', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-2">Submit Document</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input type="file" name="file" />
        <button type="submit">Submit</button>
      </form>
      {result && (
        <div className="mt-4 p-2 border rounded bg-gray-50">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
