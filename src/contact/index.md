---
layout: base.njk
title: Contact
description: Get in touch with the Ledger & Route team.
---
<section class="simple-page wrap">
  <h1>Contact</h1>
  <p class="lede">Questions, corrections, or partnership inquiries -- send us a note.</p>
  <form action="https://formspree.io/f/your-form-id" method="POST">
    <div class="form-row">
      <label for="name">Name</label>
      <input id="name" name="name" type="text" required>
    </div>
    <div class="form-row">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" required>
    </div>
    <div class="form-row">
      <label for="message">Message</label>
      <textarea id="message" name="message" rows="5" required></textarea>
    </div>
    <button class="btn" type="submit">Send message</button>
  </form>
  <p style="margin-top:28px; font-size:.9rem;">Replace the form action above with your own <a href="https://formspree.io" style="text-decoration:underline;">Formspree</a> endpoint (free tier available) once your site is live.</p>
</section>
