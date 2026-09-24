import { Helmet } from "react-helmet-async";

export default function Terms() {
  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <Helmet>
        <title>Terms of Service — Merit & Margin</title>
        <meta name="description" content="Terms governing use of the Merit & Margin website." />
      </Helmet>
      <h1 className="fw-bold">Terms of Service</h1>
      <p className="text-secondary">Last updated: 2026-06-25</p>
      <p><em>Placeholder terms — have these reviewed before publishing live.</em></p>
      <h2 className="h5 mt-4">Use of content</h2>
      <p>
        Articles on this site are for general informational purposes only and do not constitute
        financial, legal, or career advice specific to your situation.
      </p>
      <h2 className="h5 mt-4">No guarantees</h2>
      <p>We aim for accuracy but make no warranty that content is complete, current, or error-free.</p>
      <h2 className="h5 mt-4">Intellectual property</h2>
      <p>Site content is owned by Merit & Margin unless otherwise credited.</p>
    </div>
  );
}
