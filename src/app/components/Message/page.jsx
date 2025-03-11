"use client";

export default function Message({ sender, content }) {
  return (
    <div className="message">
      <strong>{sender}:</strong> {content}
    </div>
  );
}
