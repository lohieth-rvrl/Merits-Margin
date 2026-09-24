import { Helmet } from "react-helmet-async";

export default function Contact() {
  return (
    <div className="container py-5" style={{ maxWidth: 560 }}>
      <Helmet>
        <title>Contact — Merit & Margin</title>
        <meta name="description" content="Get in touch with the Merit & Margin team." />
      </Helmet>
      <h1 className="fw-bold">Contact</h1>
      <p className="lead">Questions, corrections, or partnership inquiries — send us a note.</p>
      <form action="https://formspree.io/f/your-form-id" method="POST">
        <div className="mb-3">
          <label className="form-label" htmlFor="name">Name</label>
          <input className="form-control" id="name" name="name" type="text" required />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="email">Email</label>
          <input className="form-control" id="email" name="email" type="email" required />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="message">Message</label>
          <textarea className="form-control" id="message" name="message" rows="5" required></textarea>
        </div>
        <button className="btn btn-warm" type="submit">Send message</button>
      </form>
      <p className="text-secondary small mt-4">
        Replace the form action above with your own{" "}
        <a href="https://formspree.io" target="_blank" rel="noreferrer">Formspree</a> endpoint
        (free tier available).
      </p>
    </div>
  );
}
